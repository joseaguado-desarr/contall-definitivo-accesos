import { spawn, ChildProcess } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Builder, By, until, WebDriver } from "selenium-webdriver";

const APP_URL = (process.env.SELENIUM_APP_URL || "http://127.0.0.1:5173").replace(/\/$/, "");
const LOGIN_EMAIL = process.env.SELENIUM_EMAIL || "admin@contaall.com";
const LOGIN_PASSWORD = process.env.SELENIUM_PASSWORD || "contaall";
let startedApp: ChildProcess | undefined;
const reportStartedAt = new Date();
const reportResults: Array<{ name: string; status: "passed" | "failed"; durationMs: number; error?: string }> = [];

function recordResult(name: string, status: "passed" | "failed", startedAt: number, error?: unknown): void {
  reportResults.push({
    name,
    status,
    durationMs: Date.now() - startedAt,
    ...(error ? { error: error instanceof Error ? error.message : String(error) } : {}),
  });
}

function writeReport(): void {
  const reportDirectory = path.resolve(process.cwd(), "reports");
  mkdirSync(reportDirectory, { recursive: true });

  const passed = reportResults.filter((result) => result.status === "passed").length;
  const failed = reportResults.length - passed;
  const report = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - reportStartedAt.getTime(),
    summary: { total: reportResults.length, passed, failed },
    results: reportResults,
  };

  writeFileSync(path.join(reportDirectory, "selenium-report.json"), JSON.stringify(report, null, 2));
  const markdown = [
    "# Reporte Selenium",
    "",
    `- Fecha: ${report.generatedAt}`,
    `- Total: ${report.summary.total}`,
    `- Correctos: ${passed}`,
    `- Fallidos: ${failed}`,
    "",
    "| Escenario | Estado | Duración | Error |",
    "|---|---|---:|---|",
    ...reportResults.map((result) => `| ${result.name} | ${result.status === "passed" ? "OK" : "FALLÓ"} | ${result.durationMs} ms | ${result.error || ""} |`),
    "",
  ].join("\n");
  writeFileSync(path.join(reportDirectory, "selenium-report.md"), markdown);
}

async function waitForApplication(): Promise<void> {
  try {
    const response = await fetch(`${APP_URL}/login`);
    if (response.ok) return;
  } catch {
    // The test server is not running yet.
  }

  console.log("ℹ️ Frontend no disponible; iniciando npm run dev...");
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  startedApp = spawn(npmCommand, ["run", "dev"], {
    cwd: process.cwd(),
    detached: false,
    stdio: "ignore",
  });

  const timeout = Date.now() + 30000;
  while (Date.now() < timeout) {
    try {
      const response = await fetch(`${APP_URL}/login`);
      if (response.ok) return;
    } catch {
      // Keep waiting while Vite starts.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`La aplicación no respondió en ${APP_URL} después de 30 segundos`);
}

function stopStartedApp(): void {
  if (startedApp && !startedApp.killed) {
    startedApp.kill();
  }
}

async function crearDriver(): Promise<WebDriver> {
  return new Builder().forBrowser("chrome").build();
}

async function probarRegistro(): Promise<void> {
  const startedAt = Date.now();
  const driver = await crearDriver();

  try {
    const uniqueEmail = `selenium.${Date.now()}@example.com`;
    await driver.get(`${APP_URL}/register`);

    await driver.wait(until.elementLocated(By.css('input[name="fullName"]')), 10000);
    await driver.findElement(By.css('input[name="fullName"]')).sendKeys("Usuario Selenium");
    await driver.findElement(By.css('input[name="email"]')).sendKeys(uniqueEmail);
    await driver.findElement(By.css('input[name="password"]')).sendKeys("selenium123");
    await driver.findElement(By.css('input[name="confirmPassword"]')).sendKeys("selenium123");
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(until.urlContains("/dashboard"), 10000, "El registro no redirigió al dashboard");
    await driver.wait(until.elementLocated(By.css("aside")), 10000, "El menú no apareció después del registro");
    recordResult("Registro de usuario", "passed", startedAt);
    console.log(`✅ Registro verificado: ${uniqueEmail}`);
  } catch (error) {
    recordResult("Registro de usuario", "failed", startedAt, error);
    throw error;
  } finally {
    await driver.quit();
  }
}

async function iniciarSesion(driver: WebDriver): Promise<void> {
  await driver.get(`${APP_URL}/login`);

  const inputUsuario = await driver.wait(
      until.elementLocated(By.css('input[name="email"]')),
      10000,
      "No se encontró el campo de correo",
  );
  const inputClave = await driver.wait(
      until.elementLocated(By.css('input[name="password"]')),
      10000,
      "No se encontró el campo de contraseña",
  );
  const botonEntrar = await driver.wait(
      until.elementLocated(By.css('button[type="submit"]')),
      10000,
      "No se encontró el botón de inicio de sesión",
  );

  await inputUsuario.sendKeys(LOGIN_EMAIL);
  await inputClave.sendKeys(LOGIN_PASSWORD);
  await botonEntrar.click();
  await driver.wait(until.urlContains("/dashboard"), 10000, "El login no redirigió al dashboard");
}

async function probarAplicacion(): Promise<void> {
  const startedAt = Date.now();
  const driver = await crearDriver();

  try {
    await iniciarSesion(driver);
    await driver.wait(until.elementLocated(By.css("aside")), 10000, "No se mostró el menú lateral");
    recordResult("Login administrativo", "passed", startedAt);

    const menuItems = [
      ["Dashboard", "/dashboard"],
      ["Personas", "/persons"],
      ["Visitantes", "/visitors"],
      ["Control de Acceso", "/access-control"],
      ["Historial", "/history"],
      ["Reportes", "/reports"],
      ["Usuarios", "/admin/users"],
      ["Horarios", "/admin/schedules"],
      ["Lista Negra", "/admin/blacklist"],
      ["Configuración", "/admin/settings"],
    ] as const;

    for (const [label, path] of menuItems) {
      const menuButton = await driver.wait(
        until.elementLocated(By.xpath(`//button[normalize-space()="${label}"]`)),
        10000,
        `No se encontró el menú ${label}`,
      );
      await menuButton.click();
      await driver.wait(until.urlContains(path), 10000, `El menú ${label} no abrió ${path}`);
      await driver.wait(until.elementLocated(By.css("main")), 10000, `La pantalla ${label} está vacía`);
      recordResult(`Menú: ${label}`, "passed", startedAt);
    }

    await driver.get(`${APP_URL}/persons`);
    await driver.wait(until.elementLocated(By.xpath('//button[contains(normalize-space(), "Nueva Persona")]')), 10000);
    recordResult("Pantalla: Personas", "passed", startedAt);

    await driver.get(`${APP_URL}/visitors`);
    await driver.wait(until.elementLocated(By.xpath('//button[contains(normalize-space(), "Nuevo Visitante")]')), 10000);
    recordResult("Pantalla: Visitantes", "passed", startedAt);

    await driver.get(`${APP_URL}/access-control`);
    await driver.wait(until.elementLocated(By.xpath('//h3[contains(normalize-space(), "Acceso Manual")]')), 10000);
    recordResult("Pantalla: Control de Acceso", "passed", startedAt);

    await driver.get(`${APP_URL}/history`);
    await driver.wait(until.elementLocated(By.xpath('//*[contains(normalize-space(), "Historial de Accesos")]')), 10000);
    recordResult("Pantalla: Historial", "passed", startedAt);

    await driver.get(`${APP_URL}/reports`);
    await driver.wait(until.elementLocated(By.xpath('//*[contains(normalize-space(), "Reportes")]')), 10000);
    recordResult("Pantalla: Reportes", "passed", startedAt);

    console.log("✅ Login, menús y pantallas principales verificados correctamente.");
  } catch (error) {
    recordResult("Aplicación principal", "failed", startedAt, error);
    try {
      console.error("URL actual:", await driver.getCurrentUrl());
      console.error("Contenido visible:", await driver.findElement(By.tagName("body")).getText());
    } catch {
      console.error("No fue posible leer el estado actual del navegador.");
    }
    throw error;
  } finally {
    await driver.quit();
  }
}

async function ejecutarPruebas(): Promise<void> {
  await waitForApplication();
  await probarRegistro();
  await probarAplicacion();
}

ejecutarPruebas().catch((error: unknown) => {
  console.error("❌ Error en Selenium:", error);
  process.exitCode = 1;
}).finally(() => {
  writeReport();
  console.log("📄 Reportes guardados en reports/selenium-report.json y reports/selenium-report.md");
  stopStartedApp();
});