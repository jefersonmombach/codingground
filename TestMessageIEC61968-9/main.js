/**
 * Tests with some xml libs with a IEC 61968-9 xml's
 * 
 * Jeferson Mombach de Sousa
 */
// npm install libxml-xsd
// npm install xml2js
// npm install fs

var xsd = require('libxml-xsd');
var xml2js = require('xml2js');
var fs = require('fs');

var xsdMessageWrapperPath = 'MessageWrapper.xsd';
var xsdMeterReadingsPath = 'MeterReadings.xsd';
var xmlTestPath = 'Test1.xml';

/*
console.log('Test 1 - libxml-xsd - 1');
try {
    xsd.parseFile(xsdMessageWrapperPath, function(err0, schema) {
        //console.log('1 - schema '+schema+' err0 '+err0);
        fs.readFile(xmlTestPath, 'utf-8', function(err1, data) {
            //console.log('1 - err1 '+err1);
            schema.validate(data, function(err2, validationErrors) {
                //console.log('1 - validationErrors '+validationErrors+' err2 '+err2);
            });
        });
    });
}
catch (erro) {
    var stack = erro.stack.replace(/^[^\(]+?[\n$]/gm, '')
        .replace(/^\s+at\s+/gm, '')
        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        .split('\n');
    console.log(stack);
}
*/

/*
console.log('Test 2 - libxml-xsd - 2');
try {
    fs.readFile(xsdMessageWrapperPath, 'utf-8', function(err0, xsdData) {
        console.log('2 - err0 '+err0);
        var schema = xsd.parse(xsdData);
        fs.readFile(xmlTestPath, 'utf-8', function(err1, xmlData) {
            console.log('2 - err1 '+err1);
            var validationErrors = schema.validate(xmlData);
        });
    });
}
catch (erro) {
    var stack = erro.stack.replace(/^[^\(]+?[\n$]/gm, '')
        .replace(/^\s+at\s+/gm, '')
        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        .split('\n');
    console.log(stack);
}
*/

function findNameSpace(nameSpaces, url) {
    var keys = Object.keys(nameSpaces);
    var nameSpace = '';
    
    for (var i = 0 ; i < keys.length ; i++) {
        var key = keys[i];
        var value = nameSpaces[keys[i]];
        if (value === url) {
            nameSpace = key.substring(key.indexOf('xmlns:') + 6, key.length);
            if (nameSpace.length > 0) {
                nameSpace = nameSpace+':';
            }
        }
    }
    
    return nameSpace;
}

function showError(local, err) {
    if (err !== null) {
        console.log('Error => '+local+' - '+err);
    }
}

console.log('Test 3 - libxml-xsd and xml2js');
try {
    var local = 'Test 3';
    var parser = new xml2js.Parser();
    xsd.parseFile(xsdMessageWrapperPath, function(err, xsdMessageWrapper) {
        
        showError(local, err);
        
        fs.readFile(xmlTestPath, 'utf-8', function(err0, xmlData) {
            
            showError(local, err0);
            
            var validationErrorsMessageWrapper = xsdMessageWrapper.validate(xmlData);
            showError(local, validationErrorsMessageWrapper);
            
            parser.parseString(xmlData, function (err1, xmlMessage) {
                
                showError(local, err1);
                
                //console.dir(xmlMessage);
                
                var rootKeys = Object.keys(xmlMessage);
                
                var root = xmlMessage[rootKeys[0]];
                
                //console.dir(root);
                
                var messageNS = findNameSpace(root['$'], 'http://iec.ch/TC57/2011/schema/message');
                //console.log('messageNS => '+messageNS);
                
                // Header
                //console.dir(xmlMessage[messageNS+'RequestMessage'][messageNS+'Header'][0]);
                var verb = xmlMessage[messageNS+'RequestMessage'][messageNS+'Header'][0][messageNS+'Verb'];
                console.dir(verb);
                var noun = xmlMessage[messageNS+'RequestMessage'][messageNS+'Header'][0][messageNS+'Noun'];
                console.dir(noun);
                var revision = xmlMessage[messageNS+'RequestMessage'][messageNS+'Header'][0][messageNS+'Revision'];
                console.dir(revision);
                var context = xmlMessage[messageNS+'RequestMessage'][messageNS+'Header'][0][messageNS+'Context']
                console.dir(context);
                
                // Payload
                var payloadSize = xmlMessage[messageNS+'RequestMessage'][messageNS+'Payload'].length;
                for (var p = 0 ; p < payloadSize ; p++) {
                    payload = xmlMessage[messageNS+'RequestMessage'][messageNS+'Payload'][0];
                    //console.dir(payload);
                    
                    var format = payload[messageNS+'Format'];
                    //console.log('format => '+format);
                    
                    var payloadKeys = Object.keys(payload);
                    //console.dir(payloadKeys);
                    
                    var payloadNS = findNameSpace(root['$'], 'http://iec.ch/TC57/2011/schema/'+noun+'#');
                    //console.log('payloadNS => '+payloadNS);
                    
                    xsd.parseFile(noun+'.xsd', function(err2, xsdPayload) {
                        showError(local, err2);
                        //console.log(schema);
                        
                        var builder = new xml2js.Builder();
                        var payloadXML = builder.buildObject(payload).
                            replace('<root>','').
                            replace('</root>','').
                            replace('<'+messageNS+'Format>XML</'+messageNS+'Format>','').
                            replace('<'+payloadNS+noun+'>','<'+payloadNS+noun+' xmlns'+(payloadNS !== '' ? ':' : '')+payloadNS.replace(':','')+'='+'"http://iec.ch/TC57/2011/schema/'+noun+'#"'+'>');
                        //console.log('payloadXML => '+payloadXML);
                        
                        var validationErrorsPayload = xsdPayload.validate(payloadXML);
                        showError(local, validationErrorsPayload);
                    });
                }
            });
        });
    
    });
}
catch (erro) {
    var stack = erro.stack.replace(/^[^\(]+?[\n$]/gm, '')
        .replace(/^\s+at\s+/gm, '')
        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        .split('\n');
    console.log(stack);
}