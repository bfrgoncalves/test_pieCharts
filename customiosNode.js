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
            // For each primitive we need 4 attributes: x, y, color and size.
            var ATTRIBUTES_PER_PRIMITIVE = 6,
                nodesFS = [
                'precision mediump float;',
                'varying vec4 colors;',


                'void main(void) {',

                '   if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25) {',

                        'if (gl_PointCoord.y <= 0.5){',


                            'gl_FragColor = colors;',

                        '}',
                        'else{',

                            'gl_FragColor = vec4(0.0,0.0,1.0,1.0);',
                       '}',
                '   } else {',
                '     gl_FragColor = vec4(0.0);',
                '   }',
                '}'].join('\n'),

                nodesVS = [
                'attribute vec2 a_vertexPos;',
                // Pack clor and size into vector. First elemnt is color, second - size.
                // Since it's floating point we can only use 24 bit to pack colors...
                // thus alpha channel is dropped, and is always assumed to be 1.
                'attribute float a_customAttributes;',
                'attribute float a_colors;',
                'uniform vec2 u_screenSize;',
                'uniform mat4 u_transform;',
                'varying vec4 colors;',

                'void main(void) {',
                '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
                '   gl_PointSize = a_customAttributes * u_transform[0][0];',

                '   vec4 colorToUse;',

                    'float c = a_colors;',
                 '   colorToUse.b = mod(c, 256.0); c = floor(c/256.0);',
                 '   colorToUse.g = mod(c, 256.0); c = floor(c/256.0);',
                 '   colorToUse.r = mod(c, 256.0); c = floor(c/256.0); colorToUse /= 255.0;',
                 '   colorToUse.a = 1.0;',
                 '   colors = colorToUse;',
                '}'].join('\n');

            var program,
                gl,
                buffer,
                locations,
                utils,
                nodes = new Float32Array(),
                nodesCount = 0,
                canvasWidth, canvasHeight, transform, color1, color2,color3,color4,
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
                    locations = webglUtils.getLocations(program, ['a_vertexPos', 'a_customAttributes', 'a_colors', 'u_screenSize', 'u_transform']);

                    console.log(locations.colors);

                    gl.enableVertexAttribArray(locations.vertexPos);
                    gl.enableVertexAttribArray(locations.customAttributes);
                    gl.enableVertexAttribArray(locations.colors);

                    buffer = gl.createBuffer();

                    console.log('0x'+Math.floor(Math.random()*16777215).toString(16));

                    color1='0x'+Math.floor(Math.random()*16777215).toString(16);
                    color2='0x'+Math.floor(Math.random()*16777215).toString(16);
                    color3='0x'+Math.floor(Math.random()*16777215).toString(16);
                    color4= '0x'+Math.floor(Math.random()*16777215).toString(16);
                },

                /**
                 * Called by webgl renderer to update node position in the buffer array
                 *
                 * @param nodeUI - data model for the rendered node (WebGLCircle in this case)
                 * @param pos - {x, y} coordinates of the node.
                 */
                position : function (nodeUI, pos) {
                    var idx = nodeUI.id;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = pos.y;
                    //nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = nodeUI.color;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = nodeUI.size;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = color1;
                    //nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 5] = color2;
                    //nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 6] = color3;
                    //nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 7] = color4;

                },

                /**
                 * Request from webgl renderer to actually draw our stuff into the
                 * gl context. This is the core of our shader.
                 */
                render : function() {
                    gl.useProgram(program);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);

                    if (isCanvasDirty) {
                        isCanvasDirty = false;
                        gl.uniformMatrix4fv(locations.transform, false, transform);
                        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
                    }

                    gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 0);
                    gl.vertexAttribPointer(locations.customAttributes, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 2*4);
                    gl.vertexAttribPointer(locations.colors, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)*Float32Array.BYTES_PER_ELEMENT, 3*4);

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
                    nodes = webglUtils.extendArray(nodes, nodesCount, ATTRIBUTES_PER_PRIMITIVE);
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
                        webglUtils.copyArrayPart(nodes, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
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