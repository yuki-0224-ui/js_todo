// Todoアイテムを表すクラス
class Todo {
        constructor(text) {
                this.id = Date.now();
                this.text = text;
                this.completed = false;
                this.deleted = false;
        }

        toggle() {
                this.completed = !this.completed;
        }

        update(text) {
                this.text = text;
        }

        // Todoを論理削除する
        delete() {
                this.deleted = true;
        }
}

// 削除確認ダイアログを管理するクラス
class ConfirmDialog {
        constructor() {
                // ダイアログの要素を取得
                this.dialog = document.getElementById("js-confirm-dialog");
                this.confirmButton = document.getElementById(
                        "js-confirm-delete-button",
                );
                this.cancelButton = document.getElementById(
                        "js-cancel-delete-button",
                );

                // イベントリスナーの設定
                this.confirmButton.addEventListener(
                        "click",
                        () => this.handleConfirm(),
                );
                this.cancelButton.addEventListener("click", () => this.close());
        }

        show(id, onConfirm) {
                this.todoToDelete = id;
                this.onConfirmCallback = onConfirm;
                this.dialog.classList.remove("hidden");
        }

        // コールバック関数を実行してダイアログを閉じる
        handleConfirm() {
                if (this.todoToDelete === null) return;
                this.onConfirmCallback(this.todoToDelete);
                this.close();
        }

        close() {
                this.todoToDelete = null;
                this.onConfirmCallback = null;
                this.dialog.classList.add("hidden");
        }
}

// Todoリストを管理するメインクラス
class TodoList {
        constructor() {
                this.todos = [];
                this.confirmDialog = new ConfirmDialog();
                this.initializeElements();
                this.initializeEventListeners();
                this.updateTodoList();
        }

        initializeElements() {
                this.todoInput = document.getElementById("js-todo-input");
                this.todoList = document.getElementById("js-todo-list");
                this.todoStats = document.getElementById("js-todo-stats");
                this.addButton = document.getElementById("js-add-button");
        }

        // イベントリスナーを初期化
        initializeEventListeners() {
                this.todoInput.addEventListener("keypress", (e) => {
                        if (e.key === "Enter") {
                                this.addTodo();
                        }
                });
                this.addButton.addEventListener("click", () => this.addTodo());
        }

        addTodo() {
                const text = this.todoInput.value.trim();

                if (!text) {
                        alert("タスクを入力してください。");
                        return;
                }

                const todo = new Todo(text);
                this.todos.push(todo);
                this.todoInput.value = "";
                this.updateTodoList();
        }

        toggleComplete(id) {
                const todo = this.todos.find((t) => t.id === id);
                if (todo) {
                        todo.toggle();
                        this.updateTodoList();
                }
        }

        startEdit(id) {
                // 要素の取得
                const todoItem = this.todoList.querySelector(
                        `li[data-id="${id}"]`,
                );
                const editInput = todoItem.querySelector(".edit-input");
                const todoText = todoItem.querySelector(".todo-text");
                const editButton = todoItem.querySelector(
                        "button:first-of-type",
                );

                // 編集モードの有効化
                todoText.classList.add("editing");
                editInput.classList.add("active");
                editButton.textContent = "保存";

                // 編集の準備
                editInput.value = todoText.textContent;
                editInput.focus();
        }

        saveEdit(id) {
                const todoItem = this.todoList.querySelector(
                        `li[data-id="${id}"]`,
                );
                const editInput = todoItem.querySelector(".edit-input");
                const todoText = todoItem.querySelector(".todo-text");
                const editButton = todoItem.querySelector(
                        "button:first-of-type",
                );

                // 入力値の検証
                const newText = editInput.value.trim();
                if (!newText) {
                        alert("タスクの内容を入力してください。");
                        return;
                }

                // データの更新
                const todo = this.todos.find((t) => t.id === id);
                if (!todo) {
                        alert("タスクの更新に失敗しました。");
                        return;
                }

                todo.update(newText);

                // 編集モードの終了
                todoText.classList.remove("editing");
                editInput.classList.remove("active");
                editButton.textContent = "編集";

                this.updateTodoList();
        }

        // 削除確認ダイアログを表示
        showDeleteConfirm(id) {
                this.confirmDialog.show(id, (todoId) => {
                        const todo = this.todos.find((t) => t.id === todoId);
                        if (todo) {
                                todo.delete();
                                this.todos = this.todos.filter((t) =>
                                        !t.deleted
                                );
                                this.updateTodoList();
                        }
                });
        }

        // 統計情報の更新とTodoリストの再描画を行う
        updateTodoList() {
                const total = this.todos.length;
                const completed = this.todos.filter((t) => t.completed).length;
                this.todoStats.textContent =
                        `全タスク：${total} 完了：${completed} 未完了：${
                                total - completed
                        }`;

                this.todoList.innerHTML = "";
                this.todos.forEach((todo) => {
                        const li = this.createTodoElement(todo);
                        this.todoList.appendChild(li);
                });
        }

        // 個々のTodo要素を作成
        createTodoElement(todo) {
                // Todo項目のコンテナ要素
                const li = document.createElement("li");
                li.className = todo.completed ? "completed" : "";
                li.setAttribute("data-id", todo.id);

                // チェックボックス
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = todo.completed;
                checkbox.addEventListener(
                        "change",
                        () => this.toggleComplete(todo.id),
                );

                // Todoテキスト
                const span = document.createElement("span");
                span.className = "todo-text";
                span.textContent = todo.text;

                // 編集入力フィールド
                const editInput = document.createElement("input");
                editInput.type = "text";
                editInput.className = "edit-input editing";

                // 編集ボタン
                const editButton = document.createElement("button");
                editButton.textContent = "編集";
                editButton.addEventListener("click", () => {
                        if (editButton.textContent === "編集") {
                                this.startEdit(todo.id);
                        } else {
                                this.saveEdit(todo.id);
                        }
                });

                // 削除ボタン
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "削除";
                deleteButton.addEventListener(
                        "click",
                        () => this.showDeleteConfirm(todo.id),
                );

                // 要素の組み立て
                li.append(checkbox, span, editInput, editButton, deleteButton);
                return li;
        }
}

document.addEventListener("DOMContentLoaded", () => new TodoList());
