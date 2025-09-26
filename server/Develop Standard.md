# 开发规范文档

## 分支管理规范

### 1. 分支创建规范

#### 1.1 源分支要求
- **所有开发工作必须从 `main` 分支开始**
- 在开始任何开发任务之前，必须先从 `main` 分支 fork 新分支
- 禁止直接从其他分支或已存在的功能分支进行开发

#### 1.2 分支命名规范

新分支的命名必须遵循以下格式：
```
<类型>/<描述>
```

**允许的分支类型（仅限以下7种）：**
- `feature` - 新功能开发
- `staging` - 预发布环境集成
- `release` - 版本发布集成
- `bugfix` - 错误修复
- `hotfix` - 热修复
- `test` - 测试分支
- `Develop` - 开发集成

**命名示例：**
```
✅ 正确示例：
- feature/user-authentication
- feature/new-dashboard-design
- bugfix/login-error-handling
- hotfix/critical-security-patch
- release/v2.1.0
- staging/integration-testing
- test/unit-test-coverage
- Develop/experimental-feature

❌ 错误示例：
- new-feature (缺少类型前缀)
- fix-bug (类型名称错误)
- feature (缺少描述)
- feature/ (描述为空)
- custom/new-feature (类型不在允许列表中)
```

### 2. 开发流程

#### 2.1 创建新分支
```bash
# 1. 确保在 main 分支并拉取最新代码
git checkout main
git pull origin main

# 2. 创建新分支（以 feature 为例）
git checkout -b feature/your-feature-description

# 3. 推送新分支到远程仓库
git push -u origin feature/your-feature-description
```

#### 2.2 开发过程
- 在新分支上进行所有开发工作
- 定期提交代码，保持提交信息清晰
- 提交commit时，commit内容规范如样例： git commit -m 'feat: 新增xx功能'
- 定期从 main 分支同步最新代码到开发分支（git merge origin/main）

### 2.3 commit类型说明

| commit类型 | 用途 | 示例 |
|---------|------|------|
| `feat` | 新功能开发 | `feature: 新增xxx功能` |
| `fix` | 修复 | `fix: 修复了xxx功能` |
| `Merge` | 合并同步分支commit | `Merge branch 'main' into feature/xxx` |

#### 2.4 代码合并
- 开发完成后，通过 Pull Request 将代码合并回 main 分支（在pull request前需要执行一次merge防止code conflict）
- 确保代码经过代码审查（CR）


### 3. 分支类型说明

| 分支类型 | 用途 | 示例 |
|---------|------|------|
| `feature` | 新功能开发 | `feature/user-profile-management` |
| `staging` | 预发布环境测试分支 | `staging/integration-testing` |
| `release` | 版本发布集成分支 | `release/v2.1.0_20250927` |
| `bugfix` | 错误修复 | `bugfix/memory-leak-fix` |
| `hotfix` | 热修复 | `hotfix/security-vulnerability` |
| `test` | 测试分支 | `test/unit-test-coverage` |
| `Develop` | 开发集成分支 | `Develop/experimental-feature` |

### 4. 注意事项

#### 4.1 强制要求
- **必须**从 `main` 分支 fork 新分支
- **必须**使用规范的分支命名格式
- **必须**使用允许的分支类型

#### 4.2 禁止事项
- 禁止直接从其他分支进行开发
- 禁止使用未在允许列表中的分支类型
- 禁止使用不规范的分支命名
- 禁止在 `main` 分支直接进行开发
- 禁止强制推送`main`分支！

#### 4.3 分支清理
- 合并完成后，请将源分支保留
- 保持仓库分支结构清晰

### 5. 违规处理

如果发现违反以上规范的情况：
1. 立即停止当前开发工作
2. 按照规范重新创建分支
3. 将代码迁移到新分支
4. 删除不规范的分支

---

**最后更新时间：** 2025年9月

**文档版本：** v1.0

**维护者：** 辉夜葵
