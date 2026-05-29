describe('WasteGo — Fluxos Principais', () => {

    it('Login inválido mostra erro', () => {
        cy.visit('/')
        cy.intercept('POST', 'http://localhost:8000/api/v1/auth/login', {
          statusCode: 422,
          body: { 
            success: false, 
            message: 'Email ou senha incorretos.',
            errors: { email: ['Email ou senha incorretos.'] }
          }
        })
        cy.get('input[type=email]').type('erro@teste.com')
        cy.get('input[type=password]').type('senhaerrada')
        cy.get('button[type=submit]').click()
        cy.wait(2000)
        cy.get('body').should('contain.text', 'incorretos')
      })
  
    it('Rota protegida redireciona para login', () => {
      cy.visit('/gestor')
      cy.url().should('eq', 'http://localhost:5173/')
    })
  
    it('Tela de cadastro carrega corretamente', () => {
      cy.visit('/cadastro')
      cy.contains('WasteGo').should('be.visible')
      cy.get('button[type=submit]').should('be.visible')
      cy.get('select').should('be.visible')
    })
  
    it('Tela de login carrega corretamente', () => {
      cy.visit('/')
      cy.contains('WasteGo').should('be.visible')
      cy.get('input[type=email]').should('be.visible')
      cy.get('input[type=password]').should('be.visible')
      cy.get('button[type=submit]').should('be.visible')
    })
  
  })