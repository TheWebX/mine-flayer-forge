#!/bin/bash

# Start Minecraft Forge Server Script

echo "🚀 Starting Minecraft Forge Server..."

# Check if forge server jar exists
FORGE_JAR=$(find . -name "forge-*.jar" | head -1)

if [ -z "$FORGE_JAR" ]; then
    echo "❌ Forge server jar not found!"
    echo "   Please download and place forge-*.jar in the current directory"
    echo "   Visit: https://files.minecraftforge.net/"
    exit 1
fi

echo "✅ Found Forge jar: $FORGE_JAR"

# Check if eula.txt exists
if [ ! -f eula.txt ]; then
    echo "📝 Creating eula.txt..."
    echo "eula=true" > eula.txt
    echo "✅ eula.txt created"
fi

# Start the server
echo "🎮 Starting Forge server..."
java -Xmx2G -Xms1G -jar "$FORGE_JAR" nogui

echo "🛑 Forge server stopped"