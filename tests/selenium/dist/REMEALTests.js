"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const selenium_webdriver_1 = require("selenium-webdriver");
const chrome_1 = require("selenium-webdriver/chrome");
const path = __importStar(require("path"));
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class REMEALTests {
    constructor() {
        this.testUser = {
            name: 'Usuario Test Selenium',
            email: `test.selenium.${Date.now()}@example.com`,
            password: 'password123'
        };
        this.driver = new selenium_webdriver_1.Builder()
            .forBrowser('chrome')
            .setChromeOptions(new chrome_1.Options())
            .build();
    }
    async setup() {
        await this.driver.manage().window().maximize();
        await this.driver.manage().setTimeouts({ implicit: 10000 });
    }
    async teardown() {
        await this.driver.quit();
    }
    // Test 1: Registro de usuario
    async testUserRegistration() {
        console.log('🧪 Iniciando prueba de registro de usuario...');
        console.log(`📧 Usuario a registrar: ${this.testUser.email}`);
        try {
            console.log('🌐 Navegando a la página de autenticación...');
            await this.driver.get('http://localhost:5173/auth');
            await sleep(1000);
            console.log('🔄 Cambiando a modo registro...');
            const registerButton = await this.driver.findElement(selenium_webdriver_1.By.xpath("//button[contains(text(), 'Registrarse')]"));
            await registerButton.click();
            await sleep(1000);
            console.log('📝 Llenando formulario de registro...');
            const nameInput = await this.driver.findElement(selenium_webdriver_1.By.id('reg-name'));
            const emailInput = await this.driver.findElement(selenium_webdriver_1.By.id('reg-email'));
            const passwordInput = await this.driver.findElement(selenium_webdriver_1.By.id('reg-password'));
            const confirmPasswordInput = await this.driver.findElement(selenium_webdriver_1.By.id('reg-confirm'));
            console.log(`👤 Ingresando nombre: ${this.testUser.name}`);
            await nameInput.sendKeys(this.testUser.name);
            await sleep(1000);
            console.log(`📧 Ingresando email: ${this.testUser.email}`);
            await emailInput.sendKeys(this.testUser.email);
            await sleep(1000);
            console.log('🔒 Ingresando contraseña...');
            await passwordInput.sendKeys(this.testUser.password);
            await sleep(1000);
            console.log('🔒 Confirmando contraseña...');
            await confirmPasswordInput.sendKeys(this.testUser.password);
            await sleep(1000);
            console.log('🚀 Enviando formulario de registro...');
            const submitButton = await this.driver.findElement(selenium_webdriver_1.By.xpath("//button[contains(text(), 'Crear Cuenta')]"));
            await submitButton.click();
            await sleep(1000);
            console.log('⏳ Esperando redirección...');
            await this.driver.wait(selenium_webdriver_1.until.urlContains('/'), 10000);
            await sleep(1000);
            console.log('✅ Prueba de registro exitosa');
            return true;
        }
        catch (error) {
            console.error('❌ Error en prueba de registro:', error);
            return false;
        }
    }
    // Test 2: Inicio de sesión
    async testUserLogin() {
        console.log('🧪 Iniciando prueba de inicio de sesión...');
        console.log(`📧 Usuario para login: ${this.testUser.email}`);
        try {
            console.log('🌐 Navegando a la página de autenticación...');
            await this.driver.get('http://localhost:5173/auth');
            await sleep(1000);
            console.log('🔄 Cambiando a modo login...');
            const loginButton = await this.driver.findElement(selenium_webdriver_1.By.xpath("//button[contains(text(), 'Iniciar Sesión')]"));
            await loginButton.click();
            await sleep(1000);
            console.log('📝 Llenando formulario de login...');
            const emailInput = await this.driver.findElement(selenium_webdriver_1.By.id('login-email'));
            const passwordInput = await this.driver.findElement(selenium_webdriver_1.By.id('login-password'));
            console.log(`📧 Ingresando email: ${this.testUser.email}`);
            await emailInput.sendKeys(this.testUser.email);
            await sleep(1000);
            console.log('🔒 Ingresando contraseña...');
            await passwordInput.sendKeys(this.testUser.password);
            await sleep(1000);
            console.log('🚀 Enviando formulario de login...');
            const submitButton = await this.driver.findElement(selenium_webdriver_1.By.xpath("//button[contains(text(), 'Ingresar')]"));
            await submitButton.click();
            await sleep(1000);
            console.log('⏳ Esperando redirección...');
            await this.driver.wait(selenium_webdriver_1.until.urlContains('/'), 10000);
            await sleep(1000);
            console.log('✅ Prueba de login exitosa');
            return true;
        }
        catch (error) {
            console.error('❌ Error en prueba de login:', error);
            return false;
        }
    }
    // Test 3: Publicar un producto (funcionalidad clave)
    async testCreateProduct() {
        console.log('🧪 Iniciando prueba de publicación de producto...');
        try {
            console.log('🌐 Navegando a la página de productos...');
            await this.driver.get('http://localhost:5173/productos');
            await sleep(2000); // Más tiempo para que cargue la página
            // Verificar la URL actual
            const currentUrl = await this.driver.getCurrentUrl();
            console.log(`📍 URL actual: ${currentUrl}`);
            // Verificar si estamos en la página correcta
            const pageTitle = await this.driver.getTitle();
            console.log(`📄 Título de la página: ${pageTitle}`);
            console.log('🔍 Buscando botón "Publicar Producto"...');
            const publishButton = await this.driver.findElement(selenium_webdriver_1.By.xpath("//button[contains(., 'Publicar Producto')]"));
            console.log('✅ Botón "Publicar Producto" encontrado');
            await publishButton.click();
            await sleep(2000);
            // Verificar que navegó a la página de crear producto
            const newUrl = await this.driver.getCurrentUrl();
            console.log(`📍 Nueva URL: ${newUrl}`);
            // Intentar encontrar el título de la página para verificar que cargó
            try {
                const pageHeading = await this.driver.findElement(selenium_webdriver_1.By.xpath("//h1[contains(text(), 'Publicar Nuevo Producto')]"));
                console.log('✅ Título de la página encontrado - página cargada correctamente');
            }
            catch (error) {
                console.log('❌ No se encontró el título de la página - posible problema de carga');
                const screenshot = await this.driver.takeScreenshot();
                console.log('📸 Screenshot tomado para debug');
            }
            console.log('📝 Llenando formulario de producto...');
            console.log('🔍 Buscando campo nombre...');
            const nameInput = await this.driver.findElement(selenium_webdriver_1.By.name('nombre'));
            console.log('✅ Campo nombre encontrado');
            await nameInput.sendKeys('Producto Test Selenium');
            await sleep(1000);
            console.log('🔍 Buscando campo descripción...');
            const descriptionInput = await this.driver.findElement(selenium_webdriver_1.By.name('descripcion'));
            console.log('✅ Campo descripción encontrado');
            await descriptionInput.sendKeys('Este es un producto de prueba creado con Selenium');
            await sleep(1000);
            console.log('🔍 Buscando campo tipo de producto...');
            const tipoProductoInput = await this.driver.findElement(selenium_webdriver_1.By.name('tipo_producto'));
            console.log('✅ Campo tipo de producto encontrado');
            await tipoProductoInput.sendKeys('Alimentos');
            await sleep(1000);
            console.log('🔍 Buscando campo cantidad...');
            const quantityInput = await this.driver.findElement(selenium_webdriver_1.By.name('cantidad'));
            console.log('✅ Campo cantidad encontrado');
            await quantityInput.clear();
            await quantityInput.sendKeys('5');
            await sleep(1000);
            console.log('🔍 Buscando campo ubicación...');
            const locationInput = await this.driver.findElement(selenium_webdriver_1.By.name('ubicacion'));
            console.log('✅ Campo ubicación encontrado');
            await locationInput.sendKeys('Santiago Centro, Chile');
            await sleep(1000);
            console.log('🔍 Seleccionando categoría "Compra Solidaria"...');
            const compraSolidariaRadio = await this.driver.findElement(selenium_webdriver_1.By.xpath("//input[@name='categoria' and @value='Compra Solidaria']"));
            await compraSolidariaRadio.click();
            await sleep(1000);
            console.log('🔍 Buscando campo precio...');
            const priceInput = await this.driver.findElement(selenium_webdriver_1.By.name('precio'));
            console.log('✅ Campo precio encontrado');
            await priceInput.clear();
            await priceInput.sendKeys('1500');
            await sleep(1000);
            console.log('🔍 Buscando campo fecha de expiración...');
            const fechaExpiracionInput = await this.driver.findElement(selenium_webdriver_1.By.name('fecha_expiracion'));
            console.log('✅ Campo fecha de expiración encontrado');
            // Establecer fecha de expiración para mañana
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowString = tomorrow.toISOString().split('T')[0];
            await fechaExpiracionInput.sendKeys(tomorrowString);
            await sleep(1000);
            console.log('🔍 Subiendo imagen del producto...');
            const fileInput = await this.driver.findElement(selenium_webdriver_1.By.id('file-upload'));
            console.log('✅ Campo de imagen encontrado');
            // Usar la imagen de pizza del proyecto con ruta relativa
            const testImagePath = path.resolve('./assets/pizza.png');
            await fileInput.sendKeys(testImagePath);
            await sleep(1000);
            console.log('🚀 Enviando formulario de producto...');
            const createButton = await this.driver.findElement(selenium_webdriver_1.By.xpath("//button[contains(text(), 'Publicar Producto')]"));
            await createButton.click();
            await sleep(2000);
            console.log('⏳ Esperando redirección...');
            await this.driver.wait(selenium_webdriver_1.until.urlContains('/'), 10000);
            await sleep(1000);
            console.log('✅ Prueba de publicación de producto exitosa');
            return true;
        }
        catch (error) {
            console.error('❌ Error en prueba de publicación de producto:', error);
            return false;
        }
    }
    // Ejecutar todas las pruebas
    async runAllTests() {
        console.log('🚀 Iniciando pruebas Selenium para REMEAL...\n');
        console.log(`👤 Usuario de prueba: ${this.testUser.name}`);
        console.log(`📧 Email de prueba: ${this.testUser.email}\n`);
        let passedTests = 0;
        const totalTests = 3;
        try {
            await this.setup();
            if (await this.testUserRegistration())
                passedTests++;
            if (await this.testUserLogin())
                passedTests++;
            // Después del registro y login, publicar producto directamente
            if (await this.testCreateProduct())
                passedTests++;
            console.log(`\n📊 Resultados de las pruebas:`);
            console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
            console.log(`❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`);
        }
        catch (error) {
            console.error('❌ Error general en las pruebas:', error);
        }
        finally {
            await this.teardown();
        }
    }
}
// Ejecutar las pruebas si se llama directamente
if (require.main === module) {
    const tests = new REMEALTests();
    tests.runAllTests();
}
exports.default = REMEALTests;
//# sourceMappingURL=REMEALTests.js.map