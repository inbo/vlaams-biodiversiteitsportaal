import argparse
import logging
import os.path
import tempfile
import zipfile
from os import mkdir, listdir
from os.path import basename
from pathlib import Path

from osgeo import gdal

logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)
LOGGER = logging.getLogger(__name__)

BBOX_VLAANDEREN = (
    2.54133, 51.50511, 5.91200, 50.68767,
)

GEWEST_LAYER_PATH = "/home/stefan/Documents/2025 kaartlagen/gewesten/gewesten2025.shp"



def process_grid(filename: str, output_folder: str):
    output_converted_folder = os.path.join(output_folder, Path(filename).stem)
    if not os.path.exists(output_converted_folder):
        mkdir(output_converted_folder)

    with(zipfile.ZipFile(filename, "r")) as zip_ref:
        with tempfile.TemporaryDirectory() as tmpdirname:
            for file in zip_ref.filelist:
                extracted_file = zip_ref.extract(file, tmpdirname)
                LOGGER.info(f"Cropping and converting {file.filename}")
                crop_and_covert(extracted_file, output_converted_folder)


def crop_and_covert(filename: str, output_folder: str):
    path = Path(filename)
    with tempfile.TemporaryDirectory() as tmpdirname:
        output_file = os.path.join(tmpdirname, path.stem + ".bil")

        # Use vector layer as mask instead of fixed bounding box
        gdal.Warp(
            output_file,
            filename,
            cutlineDSName=GEWEST_LAYER_PATH,  # Use shapefile as clipping boundary
            cutlineSQL="SELECT * FROM gewesten2025",
            cropToCutline=True,         # Crop output to cutline boundary
            format="eHdr"               # Output format
        )

        output = os.path.join(output_folder, path.stem + ".zip")
        LOGGER.info(f"Creating zip file {output}")
        with zipfile.ZipFile(
                output,
                "w",
                zipfile.ZIP_DEFLATED
        ) as zip_output:
            for file in listdir(tmpdirname):
                LOGGER.info(f"Adding {file}")
                zip_output.write(
                    f"{tmpdirname}/{file}",
                    basename(file)
                )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog='Convert GIS layers')
    parser.add_argument('filenames', nargs='*', help='Input files')
    parser.add_argument('-o', '--output', default="./output", help='Output folder')
    args = parser.parse_args()

    for input_file in args.filenames:
        LOGGER.info(f"Processing {input_file}")
        process_grid(input_file, args.output)
