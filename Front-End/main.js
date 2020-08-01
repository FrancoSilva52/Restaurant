let mealsState = []
let user = {}
let ruta = 'login'

const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html')
    return doc.body.firstChild
}

const renderItem = (item) => {
    const element = stringToHTML(`<li data-id="${item._id}">${item.name}</li>`)
    element.addEventListener('click', () =>{
        const mealslist = document.getElementById ('meals-lista')
        Array.from(mealslist.children).forEach(x => x.classList.remove('selected')) 
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
    })
    return element
}

const renderOrder = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHTML(`<li data-id="${order._id}">${meal.name}  ${order.user_id}</li>`) //no lee meal.name
    return element
}

const inicializaFormulario = () => {
    const orderForm = document.getElementById('orders')
    orderForm.onsubmit = (e) => { //escuchador de eventos
        e.preventDefault() //previene su comportamiento por defecto y evita refrescar
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value
        if (!mealIdValue) {
            alert('Debe seleccionar un plato')
            submit.removeAttribute('disabled')
            return
        }
        const order = {
            meal_id: mealIdValue,
            user_id: user._id,
        }

        fetch('https://serverless.francosilva.vercel.app/api/orders', {
            method: 'POST',
            header: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(order)
        }).then(x => x.json())
          .then(respuesta => {
              const renderedOrder = renderOrder(respuesta, mealsState )
              const ordersList = document.getElementById('orders-lista')
              ordersList.appendChild(renderedOrder)
              submit.removeAttribute('disabled')
          })
    }
} 

const inicilizaDatos = () => {
    fetch('https://serverless.francosilva.vercel.app/api/meals') /* <--- Api serverless para guardar los datos {
        method: 'GET', //post , put, delete
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify({ user: 'franco', password: '123'})
    }) */ //en caso de que se quiera especificar las caracteristicas de la api
    .then(response => response.json())
    .then(data => {
        mealsState = data
        const mealslist = document.getElementById ('meals-lista')
        const submit = document.getElementById('submit')
        const listItems = data.map(renderItem)
        mealslist.removeChild(mealslist.firstElementChild)
        listItems.forEach(element => {
            mealslist.appendChild(element)
        });
        
        submit.removeAttribute('disabled')

        fetch('https://serverless.francosilva.vercel.app/api/orders')
            .then(response => response.json())
            .then(ordersdata => {
                const orderlist = document.getElementById('orders-lista')
                const listorders = ordersdata.map(ordersdata => renderOrder(ordersdata, data))
                orderlist.removeChild(orderlist.firstElementChild)
                listorders.forEach(element => orderlist.appendChild(element))
            })
    })
} 

const renderApp = () => { //renderizara en base al token de login cargando las paginas
    const token = localStorage.getItem('token')
    if (token){
       user = JSON.parse(localStorage.getItem('user'))
       return renderOrders()
    }
    renderLogin()
    
}

const renderOrders = () => {
    const orderView= document.getElementById('orders-view')
    document.getElementById('app').innerHTML = orderView.innerHTML
      
    inicializaFormulario()
    inicilizaDatos()
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML
    
    

    const loginform = document.getElementById('login-form')
    loginform.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
    
    fetch('https://serverless.francosilva.vercel.app/api/auth/login', {
       method: 'POST',
        header: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({ email, password})
    }).then ( x => x.json())
    .then(respuesta => { //ver si el usuario a iniciado sesion a viendo el token
        localStorage.setIem('token', respuesta.token)
        ruta = 'orders'
        return respuesta.token
        })
        .then (token => {
            return fetch('https://serverless.francosilva.vercel.app/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                },
            })
        })
        .then(x => x.json())
        .then(fetchedUser => {
            localStorage.setIem('user', JSON.stringify(fetchedUser))
            user = fetchedUser 
            renderOrders()
        })
 }
}

window.onload = () =>{
    renderApp()

}