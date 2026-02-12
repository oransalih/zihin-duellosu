#!/bin/bash

# ============================================
# Zihin Duellosu - Baslat
# ============================================
# Bu script sunucu, tunnel ve uygulamayi
# tek komutla ayaga kaldirir.
#
# Kullanim: ./start.sh
# Durdurmak icin: Ctrl+C
# ============================================

set -e

# nvm yukle (yoksa hata verir)
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
  nvm use 20 2>/dev/null || {
    echo "Node 20 bulunamadi. Yukleniyor..."
    nvm install 20
    nvm use 20
  }
else
  echo "nvm bulunamadi. Node 20+ yuklu oldugundan emin ol."
fi

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Renk kodlari
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# Temizlik fonksiyonu - Ctrl+C ile cikista tum arka plan islemlerini durdur
cleanup() {
  echo ""
  echo -e "${YELLOW}Durduruluyor...${NC}"
  kill $SERVER_PID 2>/dev/null
  kill $TUNNEL_PID 2>/dev/null
  kill $EXPO_PID 2>/dev/null
  wait 2>/dev/null
  echo -e "${GREEN}Tum islemler durduruldu.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ============================================
# 1. SUNUCU
# ============================================
echo -e "${CYAN}[1/3] Sunucu baslatiliyor...${NC}"
cd "$PROJECT_DIR/server"
npx tsx src/index.ts &
SERVER_PID=$!
sleep 2

# Sunucu calistigini kontrol et
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo -e "${RED}Sunucu baslatilamadi!${NC}"
  exit 1
fi
echo -e "${GREEN}  Sunucu calisiyor (PID: $SERVER_PID)${NC}"

# ============================================
# 2. TUNNEL
# ============================================
echo -e "${CYAN}[2/3] Tunnel aciliyor...${NC}"
TUNNEL_OUTPUT=$(mktemp)
npx localtunnel --port 3000 > "$TUNNEL_OUTPUT" 2>&1 &
TUNNEL_PID=$!

# Tunnel URL'sini bekle
TUNNEL_URL=""
for i in {1..15}; do
  sleep 1
  TUNNEL_URL=$(grep -o 'https://[^ ]*' "$TUNNEL_OUTPUT" 2>/dev/null || true)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
done

if [ -z "$TUNNEL_URL" ]; then
  echo -e "${RED}Tunnel acilamadi!${NC}"
  cleanup
  exit 1
fi
echo -e "${GREEN}  Tunnel URL: ${YELLOW}$TUNNEL_URL${NC}"

# ============================================
# 3. SOCKET URL GUNCELLE
# ============================================
SOCKET_FILE="$PROJECT_DIR/app/src/services/socket.ts"
sed -i '' "s|const SERVER_URL = '.*';|const SERVER_URL = '$TUNNEL_URL';|" "$SOCKET_FILE"
echo -e "${GREEN}  socket.ts guncellendi${NC}"

# ============================================
# 4. EXPO BASLAT
# ============================================
echo ""
echo -e "${CYAN}[3/3] Expo baslatiliyor (tunnel modunda)...${NC}"
echo ""
echo "============================================"
echo -e "  Sunucu:  ${GREEN}localhost:3000${NC}"
echo -e "  Tunnel:  ${YELLOW}$TUNNEL_URL${NC}"
echo ""
echo -e "  ${CYAN}Asagidaki QR kodu Expo Go ile tarayin${NC}"
echo "============================================"
echo ""

cd "$PROJECT_DIR/app"
npx expo start --tunnel &
EXPO_PID=$!

# Ana islem bekle
wait $EXPO_PID 2>/dev/null
cleanup
