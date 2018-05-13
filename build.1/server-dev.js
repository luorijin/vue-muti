'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const fs=require('fs');
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const chokidar=require('chokidar');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const WebpackDevServer = require('webpack-dev-server')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)
const devServer={
    clientLogLevel: 'warning',
    // historyApiFallback: {
    //   rewrites: [
    //     { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
    //   ],
    // },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  };
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    new webpack.ProgressPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devServer.host}:${devServer.port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      })
  ]
})
const reBuild=function(type,rpath,compiler,server){
    if(!utils.isHtmlorJs(rpath)) return;
    var dirname=path.dirname(rpath);
    var basename=path.basename(rpath, path.extname(rpath))
    var entrys=compiler.options.entry;
    if(type=="DELETE"){
        var isCompile=entrys[basename].indexOf(`${dirname}\\${basename}.js`);
        if(!(entrys[basename]&&isCompile!=-1)) return;//不存在直接返回，减少重新编译次数
        //删除入口compilation的订阅
        compiler._plugins.compilation=compiler._plugins.compilation.filter(function(item){
          return item.entry!=basename;
        });
        //删除入口和html-webpack模板make的订阅
        compiler._plugins.make=compiler._plugins.make.filter(function(item){
          return item.entry!=basename&&item.entry!=`${basename}.html`;
        });
        //删除html-webpack模板的emit订阅
        compiler._plugins.emit=compiler._plugins.emit.filter(function(item){
          return item.entry!=`${basename}.html`;
        });
        server.middleware.fileSystem.unlink(path.join(process.cwd(),`dist/${basename}.html`),function(){
          console.log('\x1B[36m%s\x1B[0m',`\n删除模块==${basename}.html`)
        })
        server.invalidate();
        delete entrys[basename];
    }else if(type=="ADD"){
        if(!entrys[basename]&&fs.existsSync(`${dirname}\\${basename}.js`)&&fs.existsSync(`${dirname}\\${basename}.html`)){
          var config={},configEntry=config.entry={};configEntry[basename]=`${dirname}\\${basename}.js`;
          //热加载入口处理
          WebpackDevServer.addDevServerEntrypoints(config, devServer);
          //添加热加载入口
          compiler.apply(new MultiEntryPlugin(process.cwd(),config.entry[basename],basename));
          let conf = {
            // 模板来源
            template: `${dirname}\\${basename}.html`,
            // 文件名称
            filename: basename + '.html',
            // 页面模板需要加对应的js脚本，如果不加这行则每个页面都会引入所有的js脚本
            chunks: ['manifest', 'vendor', basename],
            inject: true
          }
          //添加模板入口
          compiler.apply(new HtmlWebpackPlugin(conf));
          entrys[basename]=config.entry[basename];
          server.invalidate();
        }
    }else{

    }
}
WebpackDevServer.addDevServerEntrypoints(devWebpackConfig, devServer);
let compiler=webpack(devWebpackConfig);
const server= new WebpackDevServer(compiler,devServer);
var watcher=chokidar.watch(path.join(__dirname,'../src/module'))
watcher.on('ready', () => {
  watcher.on('add', (path) => {
    reBuild('ADD',path,compiler,server);
  });
  watcher.on('unlink', (path) => {
    reBuild('DELETE',path,compiler,server);
  });
});
console.log(22);
server.listen(devServer.port, devServer.host, () => {
  console.log('\x1B[36m%s\x1B[0m','\n服务监听完成,代码编译中....');
});
