#!/bin/bash

set -e

OLD_NAME="LEO"
NEW_NAME="LEO"
OLD_SLUG="leo"
NEW_SLUG="leo"

echo "🔄 Phase 1: Renaming LEO → LEO"
echo "===================================="

# Phase 1: Verzeichnisse umbenennen
echo "📁 [1/4] Renaming directories..."
find . -type d -name "*leo*" | while read dir; do
  newdir=$(echo "$dir" | sed "s/$OLD_SLUG/$NEW_SLUG/g")
  if [ "$dir" != "$newdir" ]; then
    echo "  $dir → $newdir"
    mv "$dir" "$newdir"
  fi
done

# Phase 2: Dateinamen umbenennen
echo "📄 [2/4] Renaming files..."
find . -type f -name "*leo*" | while read file; do
  newfile=$(echo "$file" | sed "s/$OLD_SLUG/$NEW_SLUG/g")
  if [ "$file" != "$newfile" ]; then
    echo "  $file → $newfile"
    mv "$file" "$newfile"
  fi
done

# Phase 3: Inhalts-Replacement
echo "🔎 [3/4] Updating file contents..."
FILES=$(find . -type f \( -name "*.js" -o -name "*.json" -o -name "*.html" -o -name "*.css" -o -name "*.md" -o -name "*.bat" -o -name "*.sh" \) ! -path "./.git/*")

count=0
for file in $FILES; do
  # Preserve case replacements
  sed -i.bak \
    -e "s/\bJarvis\b/LEO/g" \
    -e "s/\bjarvis\b/leo/g" \
    -e "s/\bJARVIS\b/LEO/g" \
    -e "s/LEO_TOKEN/LEO_TOKEN/g" \
    -e "s/leo-/leo-/g" \
    "$file"
  rm "${file}.bak"
  count=$((count + 1))
done

echo "  Updated $count files"

# Phase 4: Summary
echo ""
echo "✅ Renaming complete!"
echo "===================================="
echo "Changes:"
echo "  - LEO → LEO"
echo "  - leo → leo"
echo "  - LEO → LEO"
echo "  - leo-agent → leo-agent"
echo "  - LEO.html → Leo.html"
echo ""

