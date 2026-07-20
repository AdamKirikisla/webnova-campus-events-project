function stopEnter(e) {
  if (e.key === 'Enter') e.preventDefault();
}

const card = document.querySelectorAll('.card');

// Declare button modifiers
const deleteButton = document.querySelectorAll('.delete');

// Delete Card Logic
for (let i of deleteButton) {
  i.addEventListener('click', () => i.closest('.card').remove());
}

// Edit Card Logic
const editButton = document.querySelectorAll('.edit');

for (let i of editButton) {
  i.addEventListener('click', () => {
    const thisCard = i.closest('.card'); // parent
    const categoryValue = thisCard.querySelector('.category p:last-child');
    const dateValue = thisCard.querySelector('.date p:last-child');
    const capacityValue = thisCard.querySelector('.capacity p:last-child');
    const statusValue = thisCard.querySelector('.status p:last-child');

    if (i.textContent === 'Edit') {
      categoryValue.contentEditable = true;
      categoryValue.classList.add('selected');
      categoryValue.addEventListener('keydown', stopEnter);

      dateValue.contentEditable = true;
      dateValue.classList.add('selected');
      dateValue.addEventListener('keydown', stopEnter);

      capacityValue.contentEditable = true;
      capacityValue.classList.add('selected');
      capacityValue.addEventListener('keydown', stopEnter);

      statusValue.contentEditable = true;
      statusValue.classList.add('selected');
      statusValue.addEventListener('keydown', stopEnter);

      i.textContent = 'Save';
    } else if (i.textContent === 'Save') {
      categoryValue.contentEditable = false;
      categoryValue.classList.remove('selected');

      dateValue.contentEditable = false;
      dateValue.classList.remove('selected');

      capacityValue.contentEditable = false;
      capacityValue.classList.remove('selected');

      statusValue.contentEditable = false;
      statusValue.classList.remove('selected');

      i.textContent = 'Edit';
    }
  });
}
