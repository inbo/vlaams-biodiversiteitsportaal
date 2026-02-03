#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

usage() {
  cat <<'USAGE'
Usage: create.sh [INPUT_DIR] [OUTPUT_FILE] [NODATA] [TARGET_SRS] [RESAMPLING]

Create a single GeoTIFF by merging tiled GeoTIFFs and reprojecting to a target SRS.

INPUT_DIR   Directory with tiles (default: /home/stefan/Downloads/dtm_hoogtemodel)
OUTPUT_FILE Output file path (default: <script-dir>/dtm_merged.tif)
NODATA      Optional nodata value to force (e.g. -9999). If omitted, existing nodata preserved.
TARGET_SRS  Target spatial reference system (default: EPSG:4326)
RESAMPLING  Resampling method for reprojection (default: bilinear)

Examples:
  ./create.sh
  ./create.sh /path/to/tiles /tmp/dtm_merged.tif -9999 EPSG:4326 cubic
  ./create.sh --list                 # show input files and exit
USAGE
  exit 1
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
fi

# Optional: print the list of input files and exit
LIST_ONLY=0
if [[ "${1:-}" == "--list" || "${1:-}" == "-l" ]]; then
  LIST_ONLY=1
  shift
fi

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
INPUT_DIR="${1:-/home/stefan/Downloads/dtm_hoogtemodel}"
OUTPUT_FILE="${2:-$SCRIPT_DIR/dtm_merged.tif}"
NODATA="${3:-}"
TARGET_SRS="${4:-EPSG:4326}"
RESAMPLING="${5:-bilinear}"

# Check required GDAL tools (we need gdalbuildvrt and gdalwarp for reprojection)
for cmd in gdalbuildvrt gdalwarp; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: required command '$cmd' not found. Please install GDAL (e.g. apt install gdal-bin)." >&2
    exit 1
  fi
done

# Temporary workspace
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

LIST="$TMPDIR/files.txt"
VRT="$TMPDIR/merged.vrt"

# Build list of input files (TIFFs on disk and TIFFs inside ZIPs via /vsizip/)
# Start with an empty list
: > "$LIST"

# Add extracted GeoTIFFs (if any)
find "$INPUT_DIR" -type f \( -iname '*.tif' -o -iname '*.tiff' \) | sort >> "$LIST" || true

# Also check for ZIP archives that may contain GeoTIFFs and add them via /vsizip/
ZIPS="$TMPDIR/zips.txt"
find "$INPUT_DIR" -type f -iname '*.zip' | sort > "$ZIPS" || true
if [ -s "$ZIPS" ]; then
  # Need a tool to list zip contents
  if ! command -v unzip >/dev/null 2>&1 && ! command -v zipinfo >/dev/null 2>&1; then
    echo "Zip archives found but neither 'unzip' nor 'zipinfo' is available to list contents." >&2
    echo "Install 'unzip' (recommended) or 'zipinfo'." >&2
    exit 1
  fi

  while IFS= read -r zip; do
    [ -n "$zip" ] || continue
    # absolute path to zip (so /vsizip/ path is absolute)
    ZIP_ABS="$(cd "$(dirname "$zip")" && pwd)/$(basename "$zip")"

    # list entries in the zip
    if command -v unzip >/dev/null 2>&1; then
      ZIP_ENTRIES=$(unzip -Z1 "$zip" 2>/dev/null || true)
    else
      ZIP_ENTRIES=$(zipinfo -1 "$zip" 2>/dev/null || true)
    fi

    # iterate entries and add TIFFs using the /vsizip/ virtual filesystem
    while IFS= read -r inner; do
      [ -n "$inner" ] || continue
      # skip directories
      case "$inner" in
        */) continue ;;
      esac
      inner_lc=$(printf "%s" "$inner" | tr '[:upper:]' '[:lower:]')
      case "$inner_lc" in
        *.tif|*.tiff)
          # prepend /vsizip/<abs-zip>/<inner>
          echo "/vsizip/${ZIP_ABS}/${inner}" >> "$LIST"
          ;;
      esac
    done <<< "$ZIP_ENTRIES"
  done < "$ZIPS"
fi

# Make the list deterministic and unique
sort -u "$LIST" -o "$LIST" || true

if [ ! -s "$LIST" ]; then
  echo "No GeoTIFF tiles found in '$INPUT_DIR' (no .tif/.tiff files and no .zip containing tiffs)." >&2
  exit 1
fi

# If requested, print a dry-run list of inputs and exit
if [ "$LIST_ONLY" -eq 1 ]; then
  echo "Total inputs: $(wc -l < "$LIST" | tr -d ' ')"
  echo "--- Sample (first 50) ---"
  head -n 50 "$LIST"
  exit 0
fi

# Build VRT (optionally force a nodata value)
if [ -n "$NODATA" ]; then
  gdalbuildvrt -srcnodata "$NODATA" -vrtnodata "$NODATA" -input_file_list "$LIST" "$VRT"
else
  gdalbuildvrt -input_file_list "$LIST" "$VRT"
fi

# Warp (reproject) VRT to target SRS and write a compressed, tiled GeoTIFF
# Use multiple threads when available. For elevation data bilinear resampling
# is a reasonable default; change with the RESAMPLING argument if needed.
WARP_OPTS=( -t_srs "$TARGET_SRS" -r "$RESAMPLING" -of GTiff -co TILED=YES -co COMPRESS=LZW -co BIGTIFF=IF_SAFER -multi -wo NUM_THREADS=ALL_CPUS )
if [ -n "$NODATA" ]; then
  # ensure source nodata was set in the VRT by gdalbuildvrt and set destination nodata
  WARP_OPTS+=( -dstnodata "$NODATA" )
fi

gdalwarp "${WARP_OPTS[@]}" "$VRT" "$OUTPUT_FILE"

# Create internal overviews if gdaladdo is available
if command -v gdaladdo >/dev/null 2>&1; then
  gdaladdo -r average "$OUTPUT_FILE" 2 4 8 16 || true
fi

echo "Merged raster written to: $OUTPUT_FILE"

# Also generate an ESRI .hdr labelled file (EHdr) alongside the GeoTIFF.
# We write a raw .bil plus .hdr label using the GDAL EHdr driver.
if command -v gdal_translate >/dev/null 2>&1; then
  OUTDIR=$(dirname "$OUTPUT_FILE")
  BASE=$(basename "$OUTPUT_FILE")
  BASENAME="${BASE%.*}"
  EHDR_BIN="$OUTDIR/${BASENAME}.bil"

  echo "Creating ESRI EHdr (BIL + HDR) at: ${EHDR_BIN} (and ${OUTDIR}/${BASENAME}.hdr)"
  # remove existing files if any
  rm -f "${OUTDIR}/${BASENAME}.hdr" "${OUTDIR}/${BASENAME}.bil"

  EHDR_OPTS=( -of EHdr -co INTERLEAVE=BIL )
  if [ -n "$NODATA" ]; then
    EHDR_OPTS+=( -a_nodata "$NODATA" )
  fi

  gdal_translate "${EHDR_OPTS[@]}" "$OUTPUT_FILE" "$EHDR_BIN"
  echo "ESRI EHdr files created: ${OUTDIR}/${BASENAME}.hdr ${OUTDIR}/${BASENAME}.bil"
else
  echo "gdal_translate not available; skipping ESRI EHdr output." >&2
fi
