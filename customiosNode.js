// Lets start from the easiest part - model object for node ui in webgl
function WebglCircle(size, color) {
    this.size = size;
    this.color = color;
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

function buildCircleNodeShader() {

            Math.radians = function(degrees) {
              return degrees * Math.PI / 180;
            };

            // For each primitive we need 4 attributes: x, y, color and size.
            var ATTRIBUTES_PER_PRIMITIVE = 7,
                nodesFS = [
                'precision mediump float;',
                //'varying float angle;',
                'varying float quadrant;',

                'varying vec4 color;',
                'varying float angle;',
                'varying float prevAngle;',
                'varying float totalAngles;',
                //'varying vec4 color4;',


                'void main(){',

                    //'float totalAngles = 0.0;',
                    //'float AngleToUse = 0.0;',

                    'bool found = false;',
                    'float rad = 0.0;',
                    'int prevAngleNumber = 0;',
                    'float prevTotal = 0.0;',

                    'vec4 parts = vec4(22.5);',
                    //'float prevAngle = radians(0.0);',


                    'if (quadrant == 1.0 && gl_PointCoord.y <= 0.5 && gl_PointCoord.x <= 0.5){',

                        //'prevAngle = radians(0.0);',
                        //'totalAngles = 0.0;',

                        //'for(int i = 0; i<4;i++){',
                            //'totalAngles = totalAngles + parts[i];',
                            // 'if (totalAngles <= 90.0){',
                            //     'AngleToUse = angle;',
                            // '}',
                            // 'else{',
                            //     'continue;',
                            // '}',
                            'rad = radians(angle);',
                            'if (totalAngles == 90.0 && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){',
                                // 'if (i==0) gl_FragColor = color1;',
                                // 'else if (i==1) gl_FragColor = color2;',
                                // 'else if (i==2) gl_FragColor = color3;',
                                // 'else if (i==3) gl_FragColor = color4;',
                                'gl_FragColor = color;',
                                'found = true;',
                            '}',
                            'else if ((tan(rad + prevAngle) >= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5)) && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){',
                                    // 'if (i==0) gl_FragColor = color1;',
                                    // 'else if (i==1) gl_FragColor = color2;',
                                    // 'else if (i==2) gl_FragColor = color3;',
                                    // 'else if (i==3) gl_FragColor = color4;',
                                    'gl_FragColor = color;',
                                    'found = true;',
                            '}',
                            //'prevAngle = prevAngle + rad;',
                        //'}',

                    '}',

                    'else if (quadrant == 2.0 && gl_PointCoord.y < 0.5 && gl_PointCoord.x > 0.5){',

                        //'prevAngle = radians(0.0);',
                        //'totalAngles = 90.0;',

                        //'for(int i = 0; i<4;i++){',
                            //'totalAngles = totalAngles + parts[i];',
                            // 'if (totalAngles > 90.0 && totalAngles <= 180.0){',
                            //     'AngleToUse = angle;',
                            // '}',
                            // 'else{',
                            //     'continue;',
                            // '}',
                            'rad = radians(angle);',
                            'if (totalAngles == 180.0 && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5))){',
                                // 'if (i==0) gl_FragColor = color1;',
                                // 'else if (i==1) gl_FragColor = color2;',
                                // 'else if (i==2) gl_FragColor = color3;',
                                // 'else if (i==3) gl_FragColor = color4;',
                                'gl_FragColor = color;',
                                'found = true;',
                            '}',
                            'else if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) ){',
                                    // 'if (i==0) gl_FragColor = color1;',
                                    // 'else if (i==1) gl_FragColor = color2;',
                                    // 'else if (i==2) gl_FragColor = color3;',
                                    // 'else if (i==3) gl_FragColor = color4;',
                                    'gl_FragColor = color;',
                                    'found = true;',
                            '}',
                            //'prevAngle = prevAngle + rad;',
                        //'}',
                    '}',

                   'else if (quadrant == 3.0 && gl_PointCoord.y >= 0.5 && gl_PointCoord.x >= 0.5){',

                        //'prevAngle = radians(0.0);',
                        //'totalAngles = 180.0;',

                        //'for(int i = 0; i<4;i++){',
                            //'totalAngles = totalAngles + parts[i];',
                            // 'if (totalAngles > 180.0 && totalAngles <= 270.0){',
                            //     'AngleToUse = angle;',
                            // '}',
                            // 'else {',
                            //     'continue;',
                            // '}',
                            'rad = radians(angle);',
                            'if (totalAngles == 270.0 && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x))){',
                                // 'if (i==0) gl_FragColor = color1;',
                                // 'else if (i==1) gl_FragColor = color2;',
                                // 'else if (i==2) gl_FragColor = color3;',
                                // 'else if (i==3) gl_FragColor = color4;',
                                'gl_FragColor = color;',
                                'found = true;',
                            '}',
                            'else if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) ){',
                                    // 'if (i==0) gl_FragColor = color1;',
                                    // 'else if (i==1) gl_FragColor = color2;',
                                    // 'else if (i==2) gl_FragColor = color3;',
                                    // 'else if (i==3) gl_FragColor = color4;',
                                    'gl_FragColor = color;',
                                    'found = true;',
                            '}',
                            //'prevAngle = prevAngle + rad;',
                        //'}',
                    '}',

                    'else if (quadrant == 4.0 && gl_PointCoord.y >= 0.5 && gl_PointCoord.x <= 0.5){',

                        // 'prevAngle = radians(0.0);',
                        // 'totalAngles = 270.0;',

                        //'for(int i = 0; i<4;i++){',

                            //'totalAngles = totalAngles + parts[i];',
                            // 'if (totalAngles > 270.0 && totalAngles <= 360.0){',
                            //     'AngleToUse = angle;',
                            // '}',
                            // 'else{',
                            //     'continue;',
                            // '}',
                            'rad = radians(angle);',
                            'if (angle != 0.0 && totalAngles == 360.0 && tan(prevAngle) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y))){',
                                // 'if (i==0) gl_FragColor = color1;',
                                // 'else if (i==1) gl_FragColor = color2;',
                                // 'else if (i==2) gl_FragColor = color3;',
                                // 'else if (i==3) gl_FragColor = color4;',
                                'gl_FragColor = color;',
                                'found = true;',
                            '}',
                            // 'else if(AngleToUse == 0.0){',
                            //     'found = true;',
                            //     'continue;',
                            // '}',
                            'else if (tan((rad + prevAngle)) >= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) && tan((prevAngle)) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) ){',
                                    // 'if (i==0) gl_FragColor = color1;',
                                    // 'else if (i==1) gl_FragColor = color2;',
                                    // 'else if (i==2) gl_FragColor = color3;',
                                    // 'else if (i==3) gl_FragColor = color4;',
                                    'gl_FragColor = color;',
                                    'found = true;',
                            '}',
                            //'prevAngle = prevAngle + rad;',
                        //'}',
                   '}',

                    

                'if (found == false){',
                    'if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25){',
                        'gl_FragColor = vec4(0);',
                    '}',
                    'else{',
                        'gl_FragColor = vec4(0);',
                    '}',
                '}',
                 'else if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) > 0.25){',
                    ' gl_FragColor = vec4(0);',
                 '}',
                    
                '}'].join('\n');

                nodesVS = [
                'attribute vec2 a_vertexPos;',
                // Pack clor and size into vector. First elemnt is color, second - size.
                // Since it's floating point we can only use 24 bit to pack colors...
                // thus alpha channel is dropped, and is always assumed to be 1.
                'attribute float a_quadrant;',
                'attribute vec3 a_anglesAndColor;',
                'attribute float a_totalAngles;',
                //'attribute float a_fourthColor;',
                //'attribute float a_angle;',
                'uniform vec2 u_screenSize;',
                'uniform mat4 u_transform;',
                'uniform float u_size;',

                'varying vec4 color;',
                'varying float angle;',
                'varying float prevAngle;',
                'varying float totalAngles;',
                //'varying vec4 color4;',

                'varying float quadrant;',

                'vec4 unpackColor(float c){',
                    '   vec4 colorToUse;',
                     '   colorToUse.b = mod(c, 256.0); c = floor(c/256.0);',
                     '   colorToUse.g = mod(c, 256.0); c = floor(c/256.0);',
                     '   colorToUse.r = mod(c, 256.0); c = floor(c/256.0); colorToUse /= 255.0;',
                     '   colorToUse.a = 1.0;',
                     
                     '  return colorToUse;',
                 '}',

                'void main(void) {',
                '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
                '   gl_PointSize = u_size * u_transform[0][0];',
                
                '   angle = a_anglesAndColor[0];',
                '   color = unpackColor(a_anglesAndColor[1]);',
                '   prevAngle = a_anglesAndColor[2];',
                '   totalAngles = a_totalAngles;',
                //'   color4 = unpackColor(a_fourthColor);',
                 //'   angle = a_angle;',
                 //'   prevAngle = radians(a_customAttributes[3]);',
                '   quadrant = a_quadrant;',
                '}'].join('\n');

            var program,
                gl,
                buffer,
                locations,
                utils,
                nodes1 = new Float32Array(),
                nodes2 = new Float32Array(),
                nodes3 = new Float32Array(),
                nodes4 = new Float32Array(),
                nodesCount = 0,
                canvasWidth, canvasHeight, transform, color1, color2,color3,color4, firstTime = true,
                isCanvasDirty;

            return {
                /**
                 * Called by webgl renderer to load the shader into gl context.
                 */
                load : function (glContext) {
                    console.log(nodesVS);
                    gl = glContext;
                    webglUtils = Viva.Graph.webgl(glContext);

                    program = webglUtils.createProgram(nodesVS, nodesFS);
                    gl.useProgram(program);
                    locations = webglUtils.getLocations(program, ['a_vertexPos', 'a_quadrant', 'a_anglesAndColor', 'a_totalAngles', 'u_screenSize', 'u_transform', 'u_size']);

                    gl.enableVertexAttribArray(locations.vertexPos);
                    gl.enableVertexAttribArray(locations.quadrant);
                    gl.enableVertexAttribArray(locations.anglesAndColor);
                    gl.enableVertexAttribArray(locations.totalAngles);


                    buffer = gl.createBuffer();
                    console.log(Math.radians(30));

                    console.log('0x'+Math.floor(Math.random()*16777215).toString(16));
                    colors=[];
                    colors.push('0x'+Math.floor(Math.random()*16777215).toString(16));
                    colors.push('0x'+Math.floor(Math.random()*16777215).toString(16));
                    colors.push('0x'+Math.floor(Math.random()*16777215).toString(16));
                    colors.push('0x'+Math.floor(Math.random()*16777215).toString(16));

                },

                /**
                 * Called by webgl renderer to update node position in the buffer array
                 *
                 * @param nodeUI - data model for the rendered node (WebGLCircle in this case)
                 * @param pos - {x, y} coordinates of the node.
                 */
                position : function (nodeUI, pos) {
                    var idx = nodeUI.id;

                    nodes1[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
                    nodes1[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = pos.y;
                    nodes1[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = 1; //quadrant
                    nodes1[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = 60; //angle
                    nodes1[idx * ATTRIBUTES_PER_PRIMITIVE + 4] = colors[0]; //color
                    nodes1[idx * ATTRIBUTES_PER_PRIMITIVE + 5] = Math.radians(30); //prevAngle
                    nodes1[idx * ATTRIBUTES_PER_PRIMITIVE + 6] = 90; //total Angles
                    // nodes1[idx * ATTRIBUTES_PER_PRIMITIVE + 4] = colors[1]; //quadrant
                    // nodes1[idx * ATTRIBUTES_PER_PRIMITIVE + 5] = colors[2]; //quadrant
                    // nodes1[idx * ATTRIBUTES_PER_PRIMITIVE + 6] = colors[3]; //quadrant

                    nodes2[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
                    nodes2[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = pos.y;
                    nodes2[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = 2; //quadrant
                    nodes2[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = 30; //angle
                    nodes2[idx * ATTRIBUTES_PER_PRIMITIVE + 4] = colors[1]; //color
                    nodes2[idx * ATTRIBUTES_PER_PRIMITIVE + 5] = Math.radians(0); //prevAngle
                    nodes2[idx * ATTRIBUTES_PER_PRIMITIVE + 6] = 90 + 30; //total Angles

                    nodes3[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
                    nodes3[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = pos.y;
                    nodes3[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = 3; //quadrant
                    nodes3[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = 30; //angle
                    nodes3[idx * ATTRIBUTES_PER_PRIMITIVE + 4] = colors[2]; //color
                    nodes3[idx * ATTRIBUTES_PER_PRIMITIVE + 5] = Math.radians(0); //prevAngle
                    nodes3[idx * ATTRIBUTES_PER_PRIMITIVE + 6] = 180 + 30; //total Angles

                    nodes4[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
                    nodes4[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = pos.y;
                    nodes4[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = 4; //quadrant
                    nodes4[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = 30; //angle
                    nodes4[idx * ATTRIBUTES_PER_PRIMITIVE + 4] = colors[3]; //color
                    nodes4[idx * ATTRIBUTES_PER_PRIMITIVE + 5] = Math.radians(0); //prevAngle
                    nodes4[idx * ATTRIBUTES_PER_PRIMITIVE + 6] = 270 + 30; //total Angles
                    ////
                    

                    if(firstTime) {
                        console.log(nodes2);
                        firstTime =false;
                    }




                },

                /**
                 * Request from webgl renderer to actually draw our stuff into the
                 * gl context. This is the core of our shader.
                 */
                render : function() {
                    gl.useProgram(program);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, nodes1, gl.DYNAMIC_DRAW);

                    if (isCanvasDirty) {
                        isCanvasDirty = false;
                        gl.uniformMatrix4fv(locations.transform, false, transform);
                        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
                        gl.uniform1f(locations.size, 24.0);
                    }

                    gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 0);
                    gl.vertexAttribPointer(locations.quadrant, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 2*4);
                    gl.vertexAttribPointer(locations.anglesAndColor, 3, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 3*4);
                    gl.vertexAttribPointer(locations.totalAngles, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 6*4);


                    gl.drawArrays(gl.POINTS, 0, nodesCount);


                    gl.bufferData(gl.ARRAY_BUFFER, nodes2, gl.DYNAMIC_DRAW);

                    if (isCanvasDirty) {
                        isCanvasDirty = false;
                        gl.uniformMatrix4fv(locations.transform, false, transform);
                        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
                        gl.uniform1f(locations.size, 24.0);
                    }

                    gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 0);
                    gl.vertexAttribPointer(locations.quadrant, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 2*4);
                    gl.vertexAttribPointer(locations.anglesAndColor, 2, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 3*4);
                    gl.vertexAttribPointer(locations.totalAngles, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 5*4);


                    gl.drawArrays(gl.POINTS, 0, nodesCount);

                    gl.bufferData(gl.ARRAY_BUFFER, nodes3, gl.DYNAMIC_DRAW);

                    if (isCanvasDirty) {
                        isCanvasDirty = false;
                        gl.uniformMatrix4fv(locations.transform, false, transform);
                        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
                        gl.uniform1f(locations.size, 24.0);
                    }

                    gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 0);
                    gl.vertexAttribPointer(locations.quadrant, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 2*4);
                    gl.vertexAttribPointer(locations.anglesAndColor, 2, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 3*4);
                    gl.vertexAttribPointer(locations.totalAngles, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 5*4);

                    gl.drawArrays(gl.POINTS, 0, nodesCount);

                    gl.bufferData(gl.ARRAY_BUFFER, nodes4, gl.DYNAMIC_DRAW);

                    if (isCanvasDirty) {
                        isCanvasDirty = false;
                        gl.uniformMatrix4fv(locations.transform, false, transform);
                        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
                        gl.uniform1f(locations.size, 24.0);
                    }

                    gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 0);
                    gl.vertexAttribPointer(locations.quadrant, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 2*4);
                    gl.vertexAttribPointer(locations.anglesAndColor, 2, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 3*4);
                    gl.vertexAttribPointer(locations.totalAngles, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 5*4);

                    gl.drawArrays(gl.POINTS, 0, nodesCount);
                },

                /**
                 * Called by webgl renderer when user scales/pans the canvas with nodes.
                 */
                updateTransform : function (newTransform) {
                    transform = newTransform;
                    isCanvasDirty = true;
                },

                /**
                 * Called by webgl renderer when user resizes the canvas with nodes.
                 */
                updateSize : function (newCanvasWidth, newCanvasHeight) {
                    canvasWidth = newCanvasWidth;
                    canvasHeight = newCanvasHeight;
                    isCanvasDirty = true;
                },

                /**
                 * Called by webgl renderer to notify us that the new node was created in the graph
                 */
                createNode : function (node) {
                    nodes1 = webglUtils.extendArray(nodes1, nodesCount, ATTRIBUTES_PER_PRIMITIVE);
                    nodes2 = webglUtils.extendArray(nodes2, nodesCount, ATTRIBUTES_PER_PRIMITIVE);
                    nodes3 = webglUtils.extendArray(nodes3, nodesCount, ATTRIBUTES_PER_PRIMITIVE);
                    nodes4 = webglUtils.extendArray(nodes4, nodesCount, ATTRIBUTES_PER_PRIMITIVE);
                    nodesCount += 1;
                },

                /**
                 * Called by webgl renderer to notify us that the node was removed from the graph
                 */
                removeNode : function (node) {
                    if (nodesCount > 0) { nodesCount -=1; }

                    if (node.id < nodesCount && nodesCount > 0) {
                        // we do not really delete anything from the buffer.
                        // Instead we swap deleted node with the "last" node in the
                        // buffer and decrease marker of the "last" node. Gives nice O(1)
                        // performance, but make code slightly harder than it could be:
                        webglUtils.copyArrayPart(nodes1, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
                        webglUtils.copyArrayPart(nodes2, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
                        webglUtils.copyArrayPart(nodes3, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
                        webglUtils.copyArrayPart(nodes4, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
                    }
                },

                /**
                 * This method is called by webgl renderer when it changes parts of its
                 * buffers. We don't use it here, but it's needed by API (see the comment
                 * in the removeNode() method)
                 */
                replaceProperties : function(replacedNode, newNode) {},
            };
        }