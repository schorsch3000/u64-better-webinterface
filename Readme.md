# u64-better-webinterface

A better web interface for U64 Boards.

This is not a rewrite, this is just a set of improvements to the existing web interface.

## Features

- Dark mode support (uses system settings to decide)
- Pages stay open on refresh
- Using C64 font in Basic Editor as prepared but not finished
- Added Pause / Resume button and Power off
- Added "Stay Logged In"

## how to install

- make a copy of the file `/Flash/html/index.html` on your U64 to a safe place (in case you want to revert later, a copy of the C64U's file with version 3.14 is in the orig folder)
- Download the latest release from the [releases page](https://github.com/schorsch3000/u64-better-webinterface/releases)
- Unzip the downloaded file
- Copy the contents of the zip file to the `/Flash/html` folder on your U64.
- reload or visit your u64's webinterface.

## how to revert

- Copy back the saved original file to `/Flash/html/index.html` on your U64.
- Delete all other files from that folder that were added by this mod.
- reload or visit your u64's webinterface.

## why are there now multiple files instead of just one like before?

We needed an Extra file for the font, there was nothing we could do about that.
Also splitting the code into multiple files makes it easier to maintain and faster to load.

The overall Filesize is still smaller than the original file.
