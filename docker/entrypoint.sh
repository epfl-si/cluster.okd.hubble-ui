#!/bin/bash

INJECT_JSON_FILE=/12factor.json

inject_json_file () {
    local json_file="$1" target_html_file="$2"

    sed 's/></>\n</'g < "$target_html_file" | while read line; do
        case "$line" in
            "<"script*)
                echo "<script>window._12factor = "
                cat "$json_file"
                echo ";</script>"
                ;;
        esac
        echo "$line"
    done
}

if [ -f "$INJECT_JSON_FILE" ]; then
    inject_json_file
fi

exec /usr/libexec/s2i/run
