# Crop grid layer

Simple python program that crops a given grid layer to the bounds of the Flemish region. 
It outputs every band as a separate Esri HDR file, ready for upload through the spatial-service admin UI.

Arguments:
- 'filename': the path to the input file
- 'output_dir': the path to the output directory (default = ./output)

for example:
```bash 
python convert.py ~/Downloads/wc2.1_10m_wind.zip ./output
```