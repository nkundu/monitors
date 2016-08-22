#!/bin/bash
cd "${0%/*}"
/home/pi/monitors/native/readTemp.sh &
/usr/local/bin/npm start
