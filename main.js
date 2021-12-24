const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV
process.env.NODE_ENV='production';

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

//Handle create add window
function createAddWindow(){
    addWindow = new BrowserWindow({
        height:200,
        width:300,
        title: 'Add Shoppint List Item',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });


 

    //Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname,'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Garbage collection handle
    addWindow.on('close',function(){
        addWindow = null;
    });
}


//Catch item:add
ipcMain.on('item:add',function(e,item){
console.log(item);
mainWindow.webContents.send('item:add', item);
addWindow.close();
});
//Create menu template
const mainMenuTemplate = [

    {
        label:'File',
        submenu:[
            {
                label:'Add Items',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');

                }
            },
            {
                label : 'Quit',
                acclerator : process.platform=='darwin' ? 'Shift+Q' : 'Shift+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//if mac, add empty object to menu
if(process.platform =='darwin'){
    mainMenuTemplate.unshift({});
}

//Add developer tools item if not in prod
if(process.env.NODE_ENV !=='production'){
mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
        {
            label: 'Toggle DevTools',
            acclerator : process.platform=='darwin' ? 'Shift+I' : 'Shift+I',

            click(item, focusedWindow){
                focusedWindow.toggleDevTools();
            }
        },
        {
            role: 'reload'
        }
    ]
})
}
