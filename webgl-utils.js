window.onerror = function(msg,url,lineno){
	alert(url + '(' + lineno + '): ' +msg);
}

function createShader(str,type){
		var shader = gl.createShader(type);
		gl.shaderSource(shader,str);
		gl.compileShader(shader);
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { //CHECK the compile status of the shader, by checking for the parameter gl.COMPILE_STATUS
			throw gl.getShaderInfoLog(shader);
		}
		return shader;

	}

function createProgram(vstr , fstr){
	var program = gl.createProgram();
	var vshader = createShader(vstr, gl.VERTEX_SHADER);
	var fshader = createShader(fstr, gl.FRAGMENT_SHADER);
	gl.attachShader(program,vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) { //CHECK the link status of the program, by checking for the parameter gl.LINK_STATUS
			throw gl.getProgramInfoLog(program);
		}

	return program;
}


function screenQuad(){ //Creates a buffer on the context and append the data to it. It will be used by the program

	//To create some geometry we need some BUFFER to hold some VERTEX data
	var vertexPosBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer); //Bind buffer to the Bind point named ARRAY_BUFFER
	var vertices = [-1, -1 , 1, -1, -1, 1 , 1, 1] //coordenates range from -1 to 1. So this will cover all the canvas
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); //FLOAT32ARRAY is what we need to pass to the buffer. STATIC_DRAW means that we upload the data 
																				//once and draw it several times
	vertexPosBuffer.itemSize = 2; //Atributes for the buffer. SIze and number of items
	vertexPosBuffer.numItems = 4;
	/*
	 2___ 3 
	 |\  |		//Square is defined in this case as a triangle strip, two triangles combined
	 | \ | 
	0|__\|1
	*/

	return vertexPosBuffer;

}

function linkProgram(program) { //get shaders, attach shaders to the program and link them

	var vshader = createShader(program.vshaderSource, gl.VERTEX_SHADER);
	var fshader = createShader(program.fshaderSource, gl.FRAGMENT_SHADER);
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) { //CHECK the link status of the program, by checking for the parameter gl.LINK_STATUS
			throw gl.getProgramInfoLog(program);
	}
}

function loadFile(file, callback, noChache, isJson){ // Useful for get files
	var request = new XMLHttpRequest();
	request.onreadystatechange = function(){
		if(request.readyState ==1){ //only when the ready state is 1 we can send the request
			if(isJson) {
				request.overrideMimeType('application/json'); //saying that the request is in json format
			}
			request.send();
		} else if (request.readyState == 4) { //if its 4 we can get the response
			if (request.status == 200) {
				callback(request.responseText); //response text is the file content
			} else if (request.status == 404){  //check for errors
				throw 'File "' + file + '" does not exist';
			} else {
				throw 'XHR error ' + request.status + '.';			}
		}
	};
	var url = file;
	if (noChache) {
		url += '?' + (new Date()).getTime();
	}
	request.open('GET', file, true); //open the get request
}

function loadProgram(vs, fs, callback){ //creates a program by loading the files using get requests 
	var program = gl.createProgram();
	function vshaderLoaded(str){
		program.vshaderSource = str;
		if(program.fshaderSource) {
			linkProgram(program);
			callback(program);
		}
	}
	function fshaderLoaded(str){
		program.fshaderSource = str;
		if(program.vshaderSource) {
			linkProgram(program);
			callback(program);
		}
	}
	loadFile(vs, vshaderLoaded, true); //true means no Cache
	loadFile(fs, fshaderLoaded, true);

	return program;

}