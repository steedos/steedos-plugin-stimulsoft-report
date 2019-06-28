# Stimulsoft Report Plugin for steedos

# Installation

```
$ yarn
```

# Run Client
```
$ yarn start
```

# Run Server
```
$ yarn server
```



# 报表相关接口

## 报表Express请求总入口
- /api-v2/report
> 规则 
- 所有/api-v2/report前缀的请求都会经过该总入口
- 发现URL以assets或static开头则请求下面的` 静态资源相关`
- 如果不是静态资源则返回html内容，详细请见`WEB界面相关`


## WEB界面相关
- /api-v2/report/ui #显示报表列表
- /api-v2/report/ui/:id #查看报表详细
- /api-v2/report/ui/viewer/:id #查看报表详细，同/report/:id
- /api-v2/report/ui/designer/:id #报表设计工具，同/report/:id
- /api-v2/report/ui/** #报表404界面，上述其他url以外都进404

## 数据API相关
- GET /api-v2/report/list #获取报表列表
- GET /api-v2/report/mrt/:report_id #获取报表模板
- POST/api-v2 /report/mrt/:report_id #保存报表模板
- GET /api-v2/report/data/:report_id #获取报表数据


## 静态资源相关
- /api-v2/report/assets/stimulsoft-report/** #stimulsoft相关js/css资源文件，指向@steedos/stimulsoft-report包的assets文件夹
- /api-v2/report/static/** #React打包后的js/css资源文件，指向react的build文件夹的static文件夹



