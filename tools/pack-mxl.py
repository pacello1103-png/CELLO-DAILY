#!/usr/bin/env python3
"""Zip a .musicxml file into a compressed .mxl (MusicXML container)."""
import sys, zipfile, os
src, dst = sys.argv[1], sys.argv[2]
name = os.path.basename(src).rsplit('.', 1)[0] + '.musicxml'
with zipfile.ZipFile(dst, 'w') as z:
    z.writestr(zipfile.ZipInfo('mimetype'), 'application/vnd.recordare.musicxml', compress_type=zipfile.ZIP_STORED)
    z.writestr('META-INF/container.xml', f'<?xml version="1.0" encoding="UTF-8"?>\n<container><rootfiles><rootfile full-path="{name}" media-type="application/vnd.recordare.musicxml+xml"/></rootfiles></container>\n', compress_type=zipfile.ZIP_DEFLATED)
    z.write(src, name, compress_type=zipfile.ZIP_DEFLATED)
print('wrote', dst)
