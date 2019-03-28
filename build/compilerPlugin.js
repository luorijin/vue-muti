module.exports= class compilerPlugin{
    apply(compiler) {
        const _cachePlugin=compiler.cachePlugin={};
        const _plugin=compiler.plugin;
        compiler.plugin=function(name,fn){
            _plugin.call(compiler,name,fn);
        }
        compiler.apply=function(){
            for(var i = 0; i < arguments.length; i++) {
                // if(arguments[i].entries){
                //     console.log(arguments[i].name);
                // }
                
                console.log(arguments[i]);
                arguments[i].apply(this);
            }
        }
    }
}