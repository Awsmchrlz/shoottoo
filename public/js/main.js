


  const modals = document.querySelectorAll('.modal');
  const modalButtons = document.querySelectorAll('.modalButton');
const closeModalButtons = document.querySelectorAll('.closeModal')
const overLay = document.querySelector('.overLay')

modalButtons.forEach(button=>{
    button.addEventListener('click', ()=>{
        modals.forEach(modal=>{
            if(modal.id == button.id){
                modal.classList.add('active')
     modal.classList.remove('inactive')
     overLay.classList.add('active')
            }
        })
    })
  })
  

closeModalButtons.forEach(closeModalButton=>{
     closeModalButton.addEventListener('click', ()=>{
    modals.forEach(modal=>{
     if(modal.id == closeModalButton.id){
        modal.classList.remove('active')
     modal.classList.add('inactive')
     overLay.classList.remove('active')
     setTimeout(() => {
       modal.classList.remove('inactive')
     
   }, 900);
     }
 })
    })
})

