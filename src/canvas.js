var fs    = require('fs');
var https = require('https')

// get user todo items
function getUserTodos(canvasKey) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'lwtech.instructure.com',
            path: '/api/v1/users/self/todo',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + canvasKey
            }
        }  
        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode} (get user todos)`)
            var data = '';

            res.on('data', d => {
                data += d;
            })
            
            res.on('end', () => {
                resolve(JSON.parse(data));
            })
        }) 
        req.on('error', error => {
            reject(error)
        })
        req.end()
    })
} module.exports.getUserTodos = getUserTodos;

// get a user's courses
function getUserCourses(canvasKey) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'lwtech.instructure.com',
            path: '/api/v1/courses',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + canvasKey
            }
        }  
        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode} (get courses)`)
            var data = '';

            res.on('data', d => {
                data += d;
            })
            
            res.on('end', () => {
                resolve(JSON.parse(data));
            })
        }) 
        req.on('error', error => {
            reject(error)
        })
        req.end()
    })
} module.exports.getUserCourses = getUserCourses;

function getCourseInfo(canvasKey, courseID) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'lwtech.instructure.com',
            path: `/api/v1/courses/${courseID}`,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + canvasKey
            }
        }  
        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode} (get course info)`)
            var data = '';

            res.on('data', d => {
                data += d;
            })
            
            res.on('end', () => {
                resolve(JSON.parse(data));
            })
        }) 
        req.on('error', error => {
            reject(error)
        })
        req.end()
    })
} module.exports.getCourseInfo = getCourseInfo;