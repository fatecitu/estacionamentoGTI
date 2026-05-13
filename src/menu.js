import './style.css';
import {supabase} from './supabase.js'

const botaoLogout = document.getElementById('btn-logout')

botaoLogout.addEventListener('click', async()=> {
    //iremos fazer o SignOut no Supabase
    await supabase.auth.signOut()
    window.location.assign('./index.html') //voltamos pro login
})

async function validaSessao(){
    const {data} = await supabase.auth.getSession()
    if(!data.session){ //se NÃO! tiver a sessão, volta pro login
        window.location.assign('./index.html')
    }
}
validaSessao()//Carregamos ao iniciar