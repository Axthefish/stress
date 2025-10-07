#!/bin/bash

# DNS 配置检查脚本 for stress.tw

echo "🔍 检查 stress.tw DNS 配置状态..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 A 记录
echo "📍 检查 A 记录 (stress.tw → 76.76.21.21):"
A_RECORD=$(dig +short stress.tw A | head -1)

if [ "$A_RECORD" = "76.76.21.21" ]; then
    echo "   ✅ 成功: $A_RECORD"
    A_STATUS="✅"
else
    echo "   ❌ 未配置或未生效"
    echo "   当前值: ${A_RECORD:-（无记录）}"
    echo "   期望值: 76.76.21.21"
    A_STATUS="❌"
fi

echo ""

# 检查 CNAME 记录
echo "📍 检查 CNAME 记录 (www.stress.tw → cname.vercel-dns.com):"
CNAME_RECORD=$(dig +short www.stress.tw CNAME | head -1)

if [[ "$CNAME_RECORD" == *"vercel-dns.com"* ]]; then
    echo "   ✅ 成功: $CNAME_RECORD"
    CNAME_STATUS="✅"
else
    echo "   ❌ 未配置或未生效"
    echo "   当前值: ${CNAME_RECORD:-（无记录）}"
    echo "   期望值: cname.vercel-dns.com"
    CNAME_STATUS="❌"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 总结
echo "📊 DNS 配置状态总结:"
echo "   A 记录:     $A_STATUS"
echo "   CNAME 记录: $CNAME_STATUS"
echo ""

# 给出建议
if [ "$A_STATUS" = "✅" ] && [ "$CNAME_STATUS" = "✅" ]; then
    echo "🎉 太棒了！DNS 已完全配置并生效！"
    echo ""
    echo "您现在可以访问:"
    echo "   🌐 https://stress.tw"
    echo "   🌐 https://www.stress.tw"
    echo ""
    echo "💡 提示: SSL 证书可能需要额外 10-20 分钟配置"
    
    # 测试 HTTPS 可访问性
    echo ""
    echo "🔒 测试 HTTPS 连接..."
    if curl -s -o /dev/null -w "%{http_code}" https://stress.tw | grep -q "200"; then
        echo "   ✅ https://stress.tw 可以访问！"
    else
        echo "   ⏳ https://stress.tw 正在配置 SSL，请稍等..."
    fi
    
elif [ "$A_STATUS" = "❌" ] && [ "$CNAME_STATUS" = "❌" ]; then
    echo "⏳ DNS 记录尚未配置或未生效"
    echo ""
    echo "请执行以下操作:"
    echo "1️⃣  登录 GoDaddy"
    echo "2️⃣  添加 DNS 记录（参考 QUICK_DNS_SETUP.md）"
    echo "3️⃣  等待 10-30 分钟后重新运行此脚本"
    echo ""
    echo "💡 查看详细指南:"
    echo "   cat QUICK_DNS_SETUP.md"
    
else
    echo "⚠️  部分 DNS 记录已生效，请完成剩余配置"
    echo ""
    if [ "$A_STATUS" = "❌" ]; then
        echo "⏳ 待配置: A 记录 (@ → 76.76.21.21)"
    fi
    if [ "$CNAME_STATUS" = "❌" ]; then
        echo "⏳ 待配置: CNAME 记录 (www → cname.vercel-dns.com)"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔄 要重新检查，运行: ./check-dns.sh"
echo "📖 需要帮助？查看: QUICK_DNS_SETUP.md"
echo ""

