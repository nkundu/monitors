#!/bin/bash
cd "${0%/*}"

while true; do
OUTPUT=$(sudo -s ./dht22)
HUMID=$(echo "$OUTPUT" | head -n 1 | tr -d '\n')
TEMP=$(echo "$OUTPUT" | tail -n 1 | tr -d '\n')
NOW=$(date +"%Y-%m-%d %H:%M")
echo "$NOW"",""$HUMID" >> ~/monitors/data/inputs/humid1/data.csv
echo "$NOW"",""$TEMP" >> ~/monitors/data/inputs/temp1/data.csv
sleep 60
done
