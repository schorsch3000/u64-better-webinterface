#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

oldSize="$(du -bs orig/index.html | awk '{print $1}')"
newSize="$(du -bs dist | awk '{print $1}')"

if [[ "$newSize" -gt $((oldSize )) ]]; then
  echo "New build size ($newSize bytes) exceeds the original size ($oldSize bytes)."
  echo "the claim that the new build is smaller than the original has been violated."
  exit 1
fi

echo "New build size ($newSize bytes) is within the original size ($oldSize bytes)."
percentage="$(( newSize * 100 / oldSize ))"
echo "New build size is ${percentage}% of the original size."