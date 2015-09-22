function WebglCircle(size, color, data, colorIndexes, rawData) {
			circleDataArray = assignQuadrant(getDataPercentage(data), colorIndexes);
            this.size = size;
            this.color = color;
            this.data = circleDataArray[0];
            this.rawData = rawData;
            this.colorIndexes = circleDataArray[1];
            this.angleNumbers = circleDataArray[0].length;

}

function getDataPercentage(data) {
    var arrayData = [];
    var total = 0;

    $.each(data,function() {
        total += this;
    });

     for (i = 0; i<data.length; i++){
        var result = (data[i]/total) * 360;
        if (data[i] == 0) arrayData.push(data[i]);
        else arrayData.push(result);
     }

    return arrayData;
}

function assignQuadrant(dataInPercentage, colorIndexes){
    //console.log(maxSize);
    //console.log(dataInPercentage);
    //console.log(colorIndexes);


    maxSize = dataInPercentage.length;
    newDataArray = [];
    newIndexArray = [];
    remaining = 0;
    totalAngles = 0;
    prevTotalAngles = 0;
    countData = 0;

    if (dataInPercentage.length == 0){
        return [[0],[0]];
    }
    else{
    
        while(totalAngles +  dataInPercentage[countData] <= 90){
            totalAngles += dataInPercentage[countData];
            newDataArray.push(dataInPercentage[countData]);
            newIndexArray.push(colorIndexes[countData]);
            countData++;
        }
        remaining = 90 - totalAngles;
        if (remaining > 0){
            newDataArray.push(remaining);
            newIndexArray.push(colorIndexes[countData]);
            dataInPercentage[countData] = dataInPercentage[countData] - remaining;
            totalAngles += remaining;
        } 

        while(totalAngles +  dataInPercentage[countData] <= 180){
            totalAngles += dataInPercentage[countData];
            newDataArray.push(dataInPercentage[countData]);
            newIndexArray.push(colorIndexes[countData]);
            countData++;
        }
        if(totalAngles > 0) remaining = 180 - totalAngles;
        else remaining = 90;
        if (remaining > 0){
            newDataArray.push(remaining);
            newIndexArray.push(colorIndexes[countData]);
            dataInPercentage[countData] = dataInPercentage[countData] - remaining;
            totalAngles += remaining;
        } 

        while(totalAngles +  dataInPercentage[countData] <= 270){
            totalAngles += dataInPercentage[countData];
            newDataArray.push(dataInPercentage[countData]);
            newIndexArray.push(colorIndexes[countData]);
            countData++;
        }
        if(totalAngles > 0) remaining = 270 - totalAngles;
        else remaining = 90;
        if (remaining > 0){
            newDataArray.push(remaining);
            newIndexArray.push(colorIndexes[countData]);
            dataInPercentage[countData] = dataInPercentage[countData] - remaining;
            totalAngles += remaining;
        } 

        while(totalAngles +  dataInPercentage[countData] <= 360){
            totalAngles += dataInPercentage[countData];
            newDataArray.push(dataInPercentage[countData]);
            newIndexArray.push(colorIndexes[countData]);
            countData++;
        }

        return [newDataArray, newIndexArray];
    }

}


function constructPie(webglCircle) {

		angleNumbers = webglCircle.angleNumbers;

        var ATTRIBUTES_PER_PRIMITIVE = 4 + (angleNumbers * 2), //angle numbers + color Indexes
                                                                   //totalTypes are passed directly to the fragment shader


            numberOfAngles = angleNumbers,
            attributesToVertex = '',
            anglesToArray = '',
            remainingAngles = numberOfAngles,
            countvec4 = 0,
            currentIndexA = 0,
            currentIndexC = 0,
            elementsPerVec = [];

            //console.log(ATTRIBUTES_PER_PRIMITIVE)

            var first = true;

            //console.log(ATTRIBUTES_PER_PRIMITIVE);

            var firstTime = 0;

            while(remainingAngles / 2 >= 1 || remainingAngles > 0){

                countvec4 += 1;

                var vecIndexes = 0;
                var attrTag = '';

                if (remainingAngles >= 2){
                    attrTag = 'vec4';
                    vecIndexes = 4;
                    elementsPerVec.push(vecIndexes);
                } 
                else if(remainingAngles == 1){
                    attrTag = 'vec2';
                    vecIndexes = 2;
                    elementsPerVec.push(vecIndexes);
                }
                // else{
                //     attrTag += String(remainingAngles);
                //     vecIndexes = remainingAngles;
                // } 

                attributesToVertex += 'attribute '+ attrTag +' a_anglesAndColors' + String(countvec4) + ';\n';
                //attributesToVertex += 'attribute '+ attrTag +' a_colorIndex' + String(countvec4) + ';\n';

                var isAngle = true;

                for (i = 1; i <= vecIndexes; i++){
                    
                    if (vecIndexes == 1){
                        anglesToArray += '  angles[' + String(currentIndexA) + '] = a_anglesAndColors' + String(countvec4) + ';\n';
                        anglesToArray += '  colorIndex[' + String(currentIndexC) + '] = a_colorIndex' + String(countvec4) + ';\n';
                    }
                    else{
                        if (isAngle){
                            anglesToArray += 'angles[' + String(currentIndexA) + '] = a_anglesAndColors' + String(countvec4) + '[' + String(i-1) + '];\n';
                            currentIndexA += 1;
                            isAngle = false;
                        } 
                        else{
                            anglesToArray += 'colorIndex[' + String(currentIndexC) + '] = a_anglesAndColors' + String(countvec4) + '[' + String(i-1) + '];\n';
                            currentIndexC += 1;
                            isAngle = true;
                        }
                    }
                }

                remainingAngles = remainingAngles - 2;
                
            }



            attributesToVertex += 'const int numberOfAngles = ' +  String(numberOfAngles) + ';\n';



            // for (i = 0; i<numberOfAngles; i++){

            //     anglesToArray += '  angles[' + String(i) + '] = a_angle' + String(i+1) + ';\n';
            //     anglesToArray += '  colorIndex[' + String(i) + '] = a_colorIndex' + String(i+1) + ';\n';
            // }


        var nodesVS = [
                'precision mediump float;',
                'attribute vec2 a_vertexPos;',
                // Pack clor and size into vector. First elemnt is color, second - size.
                // Since it's floating point we can only use 24 bit to pack colors...
                // thus alpha channel is dropped, and is always assumed to be 1.
                'attribute vec2 a_customAttributes;',
                String(attributesToVertex),
                'uniform vec2 u_screenSize;',
                'uniform mat4 u_transform;',
                'varying float angles['+String(numberOfAngles)+'];',
                'varying float colorIndex['+String(numberOfAngles)+'];',

                'void main(void) {',
                '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
                '   gl_PointSize = a_customAttributes[1] * u_transform[0][0];',
                    anglesToArray,
                '}'].join('\n');

        var nodesFS = [
                'precision mediump float;',
                'const int numberOfAngles = ' + String(numberOfAngles) + ';',
                'varying float angles[numberOfAngles];',
                'varying float colorIndex[numberOfAngles];',

                'vec4 currentColor = vec4(1,0,0,1);',
                //'varying vec2 vTexCoord;', //get the passing value from the vertex shader

                'vec4 getColor(float col){',
                    'vec4 colorToUse;',

                    'float c = col;',
                 '   colorToUse.b = mod(c, 256.0); c = floor(c/256.0);',
                 '   colorToUse.g = mod(c, 256.0); c = floor(c/256.0);',
                 '   colorToUse.r = mod(c, 256.0); c = floor(c/256.0); colorToUse /= 255.0;',
                 '   colorToUse.a = 1.0;',

                 'return colorToUse;',

                '}',
                
                'void main(){',

                    'float prevAngle = radians(0.0);',
                    'float radQuad = radians(90.0);',
                    'float totalAngles = 0.0;',

                    'bool found = false;',
                    'bool hasRest = false;',
                    'float rad = 0.0;',
                    'float AngleToUse = 0.0;',
                    'float rest;',
                    'int prevAngleNumber = 0;',
                    'float prevTotal = 0.0;',


                    'if (gl_PointCoord.y <= 0.5 && gl_PointCoord.x <= 0.5){',

                        'prevAngle = radians(0.0);',

                        'for(int i = 0; i<numberOfAngles;i++){',
                            'totalAngles = totalAngles + angles[i];',
                            'if (totalAngles <= 90.0){',
                                'AngleToUse = angles[i];',
                            '}',
                            'else{',
                                'continue;',
                            '}',
                            'rad = radians(AngleToUse);',
                            'if (totalAngles == 90.0 && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){',
                                'float ind = float(colorIndex[i]);',
                                'vec4 colorToUse = getColor(ind);',
                                'gl_FragColor = colorToUse;',
                                'found = true;',
                            '}',
                            'else if ((tan(rad + prevAngle) >= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5)) && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){',
                                    'float ind = float(colorIndex[i]);',
                                    'vec4 colorToUse = getColor(ind);',
                                    'gl_FragColor = colorToUse;',
                                    'found = true;',
                            '}',
                            'prevAngle = prevAngle + rad;',
                        '}',

                    '}',

                    'else if (gl_PointCoord.y < 0.5 && gl_PointCoord.x > 0.5){',

                        'prevAngle = radians(0.0);',

                        'for(int i = 0; i<numberOfAngles;i++){',
                            'totalAngles = totalAngles + angles[i];',
                            'if (totalAngles > 90.0 && totalAngles <= 180.0){',
                                'AngleToUse = angles[i];',
                            '}',
                            'else{',
                                'continue;',
                            '}',
                            'rad = radians(AngleToUse);',
                            'if (totalAngles == 180.0 && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5))){',
                                'float ind = float(colorIndex[i]);',
                                'vec4 colorToUse = getColor(ind);',
                                'gl_FragColor = colorToUse;',
                                'found = true;',
                            '}',
                            'else if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) ){',
                                    'float ind = float(colorIndex[i]);',
                                    'vec4 colorToUse = getColor(ind);',
                                    'gl_FragColor = colorToUse;',
                                    'found = true;',
                            '}',
                            'prevAngle = prevAngle + rad;',
                        '}',
                    '}',

                   'else if (gl_PointCoord.y >= 0.5 && gl_PointCoord.x >= 0.5){',

                        'prevAngle = radians(0.0);',

                        'for(int i = 0; i<numberOfAngles;i++){',
                            'totalAngles = totalAngles + angles[i];',
                            'if (totalAngles > 180.0 && totalAngles <= 270.0){',
                                'AngleToUse = angles[i];',
                            '}',
                            'else {',
                                'continue;',
                            '}',
                            'rad = radians(AngleToUse);',
                            'if (totalAngles == 270.0 && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x))){',
                                'float ind = float(colorIndex[i]);',
                                'vec4 colorToUse = getColor(ind);',
                                'gl_FragColor = colorToUse;',
                                'found = true;',
                            '}',
                            'else if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) ){',
                                    'float ind = float(colorIndex[i]);',
                                    'vec4 colorToUse = getColor(ind);',
                                    'gl_FragColor = colorToUse;',
                                    'found = true;',
                            '}',
                            'prevAngle = prevAngle + rad;',
                        '}',
                    '}',

                    'else if (gl_PointCoord.y >= 0.5 && gl_PointCoord.x <= 0.5){',

                        'prevAngle = radians(0.0);',

                        'for(int i = 0; i<numberOfAngles;i++){',

                            'totalAngles = totalAngles + angles[i];',
                            'if (totalAngles > 270.0 && totalAngles <= 360.0){',
                                'AngleToUse = angles[i];',
                            '}',
                            'else{',
                                'continue;',
                            '}',
                            'rad = radians(AngleToUse);',
                            'if (AngleToUse != 0.0 && totalAngles == 360.0 && tan(prevAngle) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y))){',
                                'float ind = float(colorIndex[i]);',
                                'vec4 colorToUse = getColor(ind);',
                                'gl_FragColor = colorToUse;',
                                'found = true;',
                            '}',
                            'else if(AngleToUse == 0.0){',
                                'found = true;',
                                'continue;',
                            '}',
                            'else if (tan((rad + prevAngle)) >= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) && tan((prevAngle)) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) ){',
                                    'float ind = float(colorIndex[i]);',
                                    'vec4 colorToUse = getColor(ind);',
                                    'gl_FragColor = colorToUse;',
                                    'found = true;',
                            '}',
                            'prevAngle = prevAngle + rad;',
                        '}',
                   '}',

                    

                'if (found == false){',
                    'if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25){',
                        'gl_FragColor = vec4(0, 0, 1, 1);',
                    '}',
                    'else{',
                        'gl_FragColor = vec4(0);',
                    '}',
                '}',
                 'else if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) > 0.25){',
                    ' gl_FragColor = vec4(0);',
                 '}',
                    
                '}'].join('\n');



    //Define VERTEX SHADER and FRAGMENT SHADER
    vs = nodesVS;
    fs = nodesFS;


    var program = createProgram(vs,fs);
    gl.useProgram(program);

    program.vertexPos = gl.getAttribLocation(program,'a_vertexPos');
    program.customAttributes = gl.getAttribLocation(program,'a_customAttributes');
    program.screenSize = gl.getUniformLocation(program,'u_screenSize');
    program.transform = gl.getUniformLocation(program,'u_transform');

    var nodes = new Float32Array(4 + angleNumbers*2);
    
    nodes[0] = 0;
    nodes[1] = 0;
    nodes[2] = webglCircle.color;
    nodes[3] = webglCircle.size;

    var countTimes = 0;
    var prevNodeIndex = 0;


    for (x = 1; x<= numberOfAngles; x++){
        nodes[3 + x + prevNodeIndex] = webglCircle.data[x-1];
        nodes[3 + x + 1 + prevNodeIndex] = webglCircle.colorIndexes[x-1];
        prevNodeIndex += 1;
    }
    

    gl.enableVertexAttribArray(program.vertexPos);
    
    for (o = 0; o <= countvec4; o++){
        gl.enableVertexAttribArray(program.customAttributes + o);
    }

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);

    gl.uniformMatrix4fv(program.transform, false, [0.9349198761484702, 0, 0, 0, 0, 0.9349198761484702, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    gl.uniform2f(program.screenSize, c.width, c.height);

    gl.vertexAttribPointer(program.vertexPos, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(program.customAttributes, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 2 * 4);

    var prevNodeIndex = 0;

    for (i = 1; i<= countvec4; i++){
        gl.vertexAttribPointer(program.customAttributes + i, elementsPerVec[i-1], gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, (4 + prevNodeIndex) * 4);
         //gl.vertexAttribPointer(locations.customAttributes + i + 1 + prevNodeIndex, 1, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, (4+i-1 + 1 + prevNodeIndex) * 4);
        prevNodeIndex += elementsPerVec[i-1];
    }

    gl.finish();
    gl.drawArrays(gl.POINTS, 0, 1);

}