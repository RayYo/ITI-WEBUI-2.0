# iti-webui-2.0

## Project setup
```
npm install

# The problem of slow download speed of npm can be solved by the following operations
npm install --registry=https://registry.npm.taobao.org
```

### Compiles and hot-reloads for development
```
# dev 走 mock 数据(public/data/*.json),入口 http://localhost:9528/
# 调试指定页面可直接开 http://localhost:9528/main.html#/<route>
npm run dev
```

### Build
两种打包模式,产物均在 `dist/`(index.html 为壳页,应用在 main.html,地址栏/标题只显示 IP):

```
# 1) 真机部署包:接真实 CGI(/cgi/get.cgi、/cgi/set.cgi),不携带 mock 数据(dist 无 data/)
npm run build

# 2) mock 静态包:交付客户部署为模拟器,携带 public/data mock 数据,
#    GET → data/<cmd>.json,SET → data/_ok.json(增删改不持久)
npm run build:mock
```

### Advanced
```
# code format check
npm run lint

# code format check and auto fix
npm run lint -- --fix
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
