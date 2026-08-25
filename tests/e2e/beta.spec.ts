import { expect, test } from '@playwright/test'

test.beforeEach(async({page})=>{await page.addInitScript(()=>{localStorage.setItem('singularity:onboarded','true');localStorage.removeItem('singularity:active')});await page.goto('/')})

test('loads the SNB shell and live Core state',async({page})=>{await expect(page).toHaveTitle(/SNB/);await expect(page.getByText('SNB',{exact:true}).first()).toBeVisible();await expect(page.getByText(/SNB CORE/)).toBeVisible()})

test('creates a persistent project through the real frontend',async({page})=>{await page.getByRole('button',{name:'Projetos',exact:true}).first().click();await expect(page.getByRole('heading',{name:'Projetos'})).toBeVisible();page.once('dialog',dialog=>dialog.accept('E2E Persistent Project'));await page.getByRole('button',{name:'Novo projeto'}).click();await expect(page.getByText('E2E Persistent Project')).toBeVisible()})

test('executes a deterministic tool and surfaces verification feedback',async({page})=>{await page.getByRole('button',{name:'Tool Registry',exact:true}).click();await expect(page.getByRole('heading',{name:'Tool Registry'})).toBeVisible();await page.locator('.module-card').filter({hasText:'Deterministic Math Aggregate'}).getByRole('button',{name:'Executar teste seguro'}).click();await expect(page.getByText(/verifier aprovado/)).toBeVisible()})

test('shows no uncaught page errors during core navigation',async({page})=>{const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));for(const label of ['Início','Conversas','Projetos','Artefatos','Mission Control','Memória','Configurações']){await page.getByRole('button',{name:label,exact:true}).first().click();await page.waitForTimeout(100)}expect(errors).toEqual([])})
