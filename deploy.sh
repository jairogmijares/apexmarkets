#!/bin/bash
cp ~/Downloads/apexmarkets/src/App.jsx /Users/jairomijares/apexmarkets/src/App.jsx
cp ~/Downloads/apexmarkets/api/chart.js /Users/jairomijares/apexmarkets/api/chart.js 2>/dev/null || true
cd /Users/jairomijares/apexmarkets
git add .
git commit -m "Update"
git push
