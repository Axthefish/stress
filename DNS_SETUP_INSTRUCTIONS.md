# 🌐 stress.tw DNS 配置说明

## ✅ 部署状态

您的网站已成功部署到 Vercel！

- **Vercel 临时地址**: https://stress-afvjr2gu6-axthefishs-projects.vercel.app
- **项目名称**: stress-tw
- **目标域名**: stress.tw

---

## 🔧 现在需要在 GoDaddy 配置 DNS

### 步骤 1: 登录 GoDaddy

1. 访问 https://www.godaddy.com
2. 登录您的账户
3. 进入 **"My Products"** (我的产品)
4. 找到 **stress.tw** 域名
5. 点击旁边的 **"DNS"** 按钮

---

### 步骤 2: 添加 DNS 记录

#### 记录 1: A 记录（根域名）

```
类型 (Type): A
名称 (Name): @
值 (Value): 76.76.21.21
TTL: 600 seconds (或选择 "Automatic")
```

**操作步骤**：
1. 点击 **"Add"** (添加) 按钮
2. 在 "Type" 下拉菜单选择 **"A"**
3. 在 "Name" 输入 **@** （代表根域名）
4. 在 "Value" 输入 **76.76.21.21**
5. TTL 选择 **600** 或 Automatic
6. 点击 **"Save"** (保存)

#### 记录 2: CNAME 记录（www 子域名）

```
类型 (Type): CNAME
名称 (Name): www
值 (Value): cname.vercel-dns.com
TTL: 600 seconds
```

**操作步骤**：
1. 再次点击 **"Add"** (添加) 按钮
2. 在 "Type" 下拉菜单选择 **"CNAME"**
3. 在 "Name" 输入 **www**
4. 在 "Value" 输入 **cname.vercel-dns.com**
5. TTL 选择 **600**
6. 点击 **"Save"** (保存)

---

### 步骤 3: 删除冲突的记录（重要！）

在添加新记录前，您需要删除可能冲突的旧记录：

**需要删除的记录**：
- 任何 Name 为 **@** 的 A 记录（如果有的话）
- 任何 Name 为 **www** 的 CNAME 记录（如果有的话）
- GoDaddy 默认的"停放页面"记录

**如何删除**：
1. 找到这些记录
2. 点击旁边的垃圾桶图标 🗑️ 或编辑按钮
3. 点击 **"Delete"** 确认删除

---

### 步骤 4: 等待 DNS 生效

DNS 记录添加后：
- **最快**: 5-10 分钟
- **通常**: 10-30 分钟
- **最长**: 可能需要 48 小时（极少情况）

**如何检查 DNS 是否生效**：

#### 方法 1: 使用在线工具
访问: https://dnschecker.org/
- 输入: `stress.tw`
- 点击 "Search"
- 查看全球各地的 DNS 解析结果
- 如果看到 `76.76.21.21`，说明已生效

#### 方法 2: 使用终端命令（Mac/Linux）
```bash
dig stress.tw
# 应该看到 76.76.21.21

dig www.stress.tw
# 应该看到 CNAME 指向 cname.vercel-dns.com
```

---

## 🎉 验证部署成功

DNS 生效后，访问以下地址测试：

1. **https://stress.tw** - 主域名
2. **https://www.stress.tw** - WWW 子域名

**成功标志**：
- ✅ 显示您的应用界面
- ✅ 浏览器地址栏显示 🔒 安全图标
- ✅ 所有功能正常（创建小球、爆炸特效等）

---

## 🔒 SSL 证书

Vercel 会自动为您的域名配置免费的 SSL 证书（Let's Encrypt）：

- DNS 生效后，Vercel 会自动检测
- 10-20 分钟内自动颁发 SSL 证书
- 无需任何手动操作

**如果 SSL 证书未自动配置**：
1. 登录 Vercel Dashboard: https://vercel.com/dashboard
2. 进入 stress-tw 项目
3. 点击 "Domains" 标签
4. 找到 stress.tw，点击 "Refresh" 按钮

---

## 📊 Vercel Dashboard 操作

访问您的项目控制面板：
https://vercel.com/axthefishs-projects/stress-tw

**可以在这里**：
- 查看部署状态
- 管理域名
- 查看访问分析
- 设置环境变量
- 查看部署日志

---

## ⚠️ 常见问题

### 问题 1: "网站无法访问"
**原因**: DNS 还未生效
**解决**: 等待 10-30 分钟，清除浏览器缓存后重试

### 问题 2: "您的连接不是私密连接"
**原因**: SSL 证书还在配置中
**解决**: 等待 10-20 分钟，Vercel 会自动配置

### 问题 3: 显示 404 错误
**原因**: 
- DNS 配置错误
- Vercel 项目设置问题

**解决**:
1. 检查 DNS 记录是否正确
2. 访问 Vercel 临时地址测试（如果临时地址正常，说明是 DNS 问题）
3. 在 Vercel Dashboard 检查域名状态

### 问题 4: GoDaddy 说"域名已被锁定"
**解决**:
1. 在 GoDaddy 域名设置中
2. 找到 "Domain Lock" 或"Transfer Lock"
3. 暂时解锁（Toggle to OFF）
4. 添加 DNS 记录后可以重新锁定

---

## 🎯 配置后的预期结果

### 最终 DNS 配置应该是：

```
类型    名称    值                         TTL
------------------------------------------------
A       @       76.76.21.21               600
CNAME   www     cname.vercel-dns.com      600
```

### Vercel 项目设置：

- Production URL: https://stress.tw
- Git Branch: main
- Framework: None (Static)
- Root Directory: ./
- Output Directory: .

---

## 📞 需要帮助？

### GoDaddy 支持
- 在线聊天: https://www.godaddy.com/help
- 电话支持: 可在您的账户页面查看

### Vercel 支持
- 文档: https://vercel.com/docs
- 社区: https://vercel.com/discord

### 检查部署状态
访问: https://vercel.com/axthefishs-projects/stress-tw

---

## ✅ 完成清单

完成以下步骤后，您的网站就完全上线了：

- [ ] 登录 GoDaddy
- [ ] 找到 stress.tw 的 DNS 设置
- [ ] 删除旧的 A 和 CNAME 记录（如有）
- [ ] 添加新的 A 记录 (@ → 76.76.21.21)
- [ ] 添加新的 CNAME 记录 (www → cname.vercel-dns.com)
- [ ] 保存所有更改
- [ ] 等待 10-30 分钟 DNS 生效
- [ ] 访问 https://stress.tw 验证
- [ ] 检查 SSL 证书是否自动配置
- [ ] 测试所有功能

---

**🎊 完成后，您的网站将在 https://stress.tw 正式上线！**

需要进一步帮助，请随时联系。祝您部署顺利！🚀

