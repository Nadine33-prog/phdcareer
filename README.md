# 学术之外 · Beyond Academia

面向中国博士的职业探索平台。用来看方向、对照门槛、扫招聘启事里的风险，不撮合招聘。

品牌英文名 Beyond Academia 可以保留，面向用户的文案一律用简体中文。

本地从零装起来的步骤，也可以看根目录的 `使用说明.txt`。

## 能做什么

- 八类职业地图：学术支撑、党政管理、社会智库、科技企业、文化出版、医疗健康、军警文职、其他
- 岗位精选和岗位详情
- 去向、薪资、访谈等职业数据
- 三件决策工具：学术职业门槛评估、博士职位预警、博士非学术职位评估
- 管理后台：改岗位和数据，也能改评估权重和预警规则

现在库里的岗位和数据是示意的，方便先把页面走通。真实数据可以在后台改，也可以填 `data/collect` 里的表。

## 环境

- Node.js 20 及以上
- MySQL 8
- 数据库名：`phd_career`

## 本地启动

1. 建空库

```
CREATE DATABASE phd_career DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 复制 `server/.env.example` 为 `server/.env`，把 MySQL 密码改成你自己的。

3. 安装并导入示例数据（只第一次装的时候跑 seed）

```
npm install
cd server
npm install
npx prisma migrate deploy
npx prisma db seed
cd ..
```

4. 回到项目根目录启动

```
npm run dev
```

- 前台：http://localhost:5173
- 接口：http://localhost:3000
- 后台：http://localhost:5173/admin  
  用户名 `admin`，密码 `admin123`

以后在后台改过真实数据，就不要再跑 `npx prisma db seed`，会覆盖岗位等内容。

## 决策工具现在怎么算

- 门槛评估：七维加权打分。百分位目前是示意估算。答卷会匿名落库，大约满 200 份后可以改成跟真实填表的人对比。
- 非学术职位评估：题目和八个分类做加权匹配。权重可以在后台「权重矩阵」里改。
- 职位预警：按关键词和规则扫 JD。规则可以在后台「风险规则」里加。

## 目录

```
src/                 前台
server/              接口和 Prisma
server/prisma/       表结构和迁移
data/collect/        给编辑填的采集表
使用说明.txt         给本机部署看的步骤
```
