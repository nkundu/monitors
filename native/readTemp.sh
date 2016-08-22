#!/bin/bash
while true; do
OUTPUT=$(sudo ./dht22)
HUMID=$(echo "$OUTPUT" | head -n 1 | tr -d '\n')
TEMP=$(echo "$OUTPUT" | tail -n 1 | tr -d '\n')
NOW=$(date +"%Y-%m-%d %H:%M")
echo $NOW
echo $HUMID
echo $TEMP
sleep 60
done
