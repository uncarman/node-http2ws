## 转发服务中间键
解决本地主机websocket无法远程连接，通过http协议将执行命令发送给内网websocket获取返回数据。

###请求格式
#### request
method: post
path: /sendCmd
header: {
	"Content-Type": "application/x-www-form-urlencoded"
}
body: {
	"cmd": "SELECT|Bacnet.2F.L-201A_40001.PresentValue|END"
}

#### response, string
"{\"command\":\"SELECT\",\"dataList\":[{\"command\":\"HANDLE\",\"dateTime\":\"2020-04-27 14:55:33\",\"serverCode\":\"86081272\",\"state\":\"Good\",\"sysCode\":\"light\",\"tagCode\":\"Bacnet.2F.L-201A_40001.PresentValue\",\"tagNumber\":\"86248912\",\"value\":\"0\",\"valueType\":\"Boolean\"}]}"



## 启动
npm run prod
