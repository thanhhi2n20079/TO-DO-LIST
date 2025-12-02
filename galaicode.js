document,addEventListener(`DOMContentLoaded`, () => {
    // 1. Get DOM elements
    const form = document.querySelector(`.form`)
    const inputTask = document.getElementById(`input_task`);
    const todoList = document.querySelector(`.todolist`);
    const clearAllBtn = document.querySelector(`.clear_all`);
    const fieldset = document.querySelector(`.fieldset`);

    // 2. Load tasks from local storage when the page loads
        let tasks = JSON.parse(localStorage.getItem(`tasks`)) || [];
        tasks.forEach(task => renderTask(task));

    // 3. CAP NHAT TRANG THAI NUT 'Clear ALL'
        updateClearAllState();
    
    // 4. Event Listeners
    form.addEventListener(`submit`, addTask);
    todoList.addEventListener(`click`, handleTaskActions);
    clearAllBtn.addEventListener(`click`, clearAllTasks); 

    // 5. clearALL btn
    function updateClearAllState() {
        // Vô hiệu hóa nút nếu danh sách rỗng, kích hoạt nếu có công việc
        clearAllBtn.disabled = tasks.length === 0;
    }

    // 6. Lưu tasks vào Local Storage
    function saveTasks(){
        localStorage.setItem(`tasks`, JSON.stringify(tasks));
        updateClearAllState();
    }

    // 7. Tạo phần tử HTML cho một công việc và chèn vào DOM
    function renderTask(task) {
        const listItem = document.createElement(`li`);
        listItem.classList.add(`task_item`);
        listItem.dataset.id = task.id;

        if (document.querySelector(`[data-id="${task.id}"]`)) return;

        listItem.innerHTML = `
            <div class="left">
                <input type="checkbox" class="check_task" ${task.completed ? 'checked' : ''}>
                <span class="task_content ${task.completed ? 'completed' : ''}">${task.content}</span>
            </div>
            <div class="right">
                <button class="edit_btn">✏️</button>
                <button class="delete_btn">❌</button>
            </div>
        `;
        
        // Chèn vào danh sách
        todoList.appendChild(listItem);
    }

    // 8. Thêm công việc mới
    function addTask(e) {
        e.preventDefault();

        const content = inputTask.value.trim();
        
        if (content === '') {
            alert('Vui lòng nhập nội dung công việc!')
            return;
        }

        const newTask = {
            id: Date.now(),
            content: content,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        renderTask(newTask);

        inputTask.value = '';
        inputTask.focus();
    }

    // 9. Xử lý các thao tác Xóa, Hoàn thành, và Chỉnh sửa 
    function handleTaskActions(e) {
        const target = e.target;
        const listItem = target.closest('.task_item');

        if (!listItem) return;

        const taskID = Number(listItem.dataset.id);

        if (target.classList.contains('check_task')) {
            toggleTaskComplete(listItem, taskID, target.checked);

        } else if (target.classList.contains('delete_btn')){
            deleteTask(listItem, taskID);

        } else if (target.classList.contains('edit_btn')){
            toggleEditMode(listItem, taskID);
        }
    }

    // 10. Chuyển đổi trạng thái hoàn thành
    function toggleTaskComplete(listItem, taskID, isCompleted) {
        const taskIndex = tasks.findIndex(t => t.id === taskID);

        if (taskIndex !== -1) {
            tasks[taskIndex].completed = isCompleted;
            saveTasks();
        }

        const contentSpan = listItem.querySelector('.task_content');
        if (contentSpan) {
            contentSpan.classList.toggle('completed', isCompleted);
        }
    }

    // 11. Xóa công việc
    function deleteTask(listItem, taskID) {
        tasks = tasks.filter(t => t.id !== taskID);
        saveTasks();
        listItem.remove();
    }

    // 12. Chuyển đổi chế độ chỉnh sửa (hiện input)
    function toggleEditMode(listItem, taskID) {
        const taskContentSpan = listItem.querySelector('.task_content');
        const editButton = listItem.querySelector('.edit_btn');
        const isEditing = listItem.classList.contains('editing');

        if (!isEditing) {
            const currentContent = taskContentSpan.textContent;
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = currentContent;
            editInput.classList.add('edit_input');

            taskContentSpan.replaceWith(editInput);

            editInput.focus();
            listItem.classList.add('editing');
            editButton.textContent = '💾'; // Biểu tượng Lưu

            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit(listItem, taskID, editInput, editButton);
                }
            });
        } else {
            const editInput = listItem.querySelector('.edit_input');
            saveEdit(listItem, taskID, editInput, editButton);
        }
    }

    // 13. Lưu chỉnh sửa và thoát chế độ chỉnh sửa
    function saveEdit(listItem, taskID, editInput, editButton) {
        const newContent = editInput.value.trim();

        if (newContent === '') {
            alert('Nội dung công việc không được để trống!');
            editInput.focus();
            return;
        }

        const taskIndex = tasks.findIndex(t => t.id === taskID);
        if (taskIndex !== -1) {
            tasks[taskIndex].content = newContent;
            saveTasks();
        }

        const newSpan = document.createElement('span');
        newSpan.classList.add('task_content');
        newSpan.textContent = newContent;

        if (tasks[taskIndex].completed) {
            newSpan.classList.add('completed');
        }

        editInput.replaceWith(newSpan);
        listItem.classList.remove('editing');
        editButton.textContent = '✏️';
    }

    // 14. Xóa tất cả công việc
    function clearAllTasks() {
        if (tasks.length === 0) return;

        if ( confirm('Bạn có chắc chắn muốn xóa TẤT CẢ công việc không?')) {
            tasks = [];
            todoList.innerHTML = '';
            saveTasks();
        }
    }
});