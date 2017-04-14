const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()

const {app, runServer, closeServer} = require('../server')

chai.use(chaiHttp)

describe('Recipe list', function(){
  //Run server to avoid errors
  before(function(){
    return runServer()
  })

  //Close for when tests are finished
  after(function(){
    return closeServer()
  })

  it('Should get all of my recipes', function(){
    return chai.request(app)
      .get('/recipes')
      .then(function(res){
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('array')

        // The lenght of my array should be at least 1
        res.body.length.should.be.at.least(1)
        const expectedKeys = ['id', 'name', 'ingredients']
        res.body.forEach(function(recipe){
          recipe.should.be.a('object')
          recipe.ingredients.should.be.a('array')
          recipe.should.include.keys(expectedKeys)
        })
      })
  })

  it('Should create a new recipe with POST', function(){
    const newRecipe = {name: 'omelette', ingredients:['eggs', 'cheese', 'mushrooms', 'bacon']}
    return chai.request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res){
        res.should.have.status(201)
        res.should.be.json
        res.should.be.a('object')
        res.body.should.include.keys('id', 'name', 'ingredients')
        res.body.name.should.equal(newRecipe.name) 
        res.body.ingredients.should.be.a('array')
        res.body.id.should.not.be.null
        res.body.should.deep.equal(Object.assign(newRecipe, {id:res.body.id}))
      })
  })

  it('should update recipes on PUT', function() {

    const updateRecipe = {
      name: 'foo',
      ingredients: ['bizz', 'bang']
    }

    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        updateRecipe.id = res.body[0].id

        return chai.request(app)
          .put(`/recipes/${updateRecipe.id}`)
          .send(updateRecipe)
      })
      .then(function(res) {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.include.keys('id', 'name', 'ingredients')
        res.body.name.should.equal(updateRecipe.name)
        res.body.id.should.equal(updateRecipe.id)
        res.body.ingredients.should.include.members(updateRecipe.ingredients)
      })
  })

  it('Should DELETE a recipe', function(){
    return chai.request(app)
      .get('/recipes')
      .then(function(res){
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`)
      })
      .then(function(res){
        res.should.have.status(204)
      })
  })
})
