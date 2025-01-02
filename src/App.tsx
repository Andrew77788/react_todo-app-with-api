import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Todo } from './types/Todo';
import { ErrorMessage } from './componens/ErrorMessage';
import { FilterType } from './types/FilterType';
import {
  USER_ID,
  deleteTodo,
  getTodos,
  postTodo,
  updateTodo,
} from './api/todos';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todo, setTodo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>(FilterType.All);
  const [isLoadingIds, setIsLoadingIds] = useState<number[]>([]);
  const [changeTodoId, setChangeTodoId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [closeInput, setCloseInput] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!todo) {
      inputRef.current?.focus();
    }
  }, [todo]);

  const addLoadingId = (id: number) => {
    setIsLoadingIds(prev => [...prev, id]);
  };

  const removeLoadingId = (
    id: number = isLoadingIds[isLoadingIds.length - 1],
  ) => {
    setIsLoadingIds(prev => prev.filter(isLoading => isLoading !== id));
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  useEffect(() => {
    const fetchTodos = () => {
      getTodos()
        .then(todosList => {
          setTodos(todosList);
        })
        .catch(() => handleError('Unable to load todos'));
    };

    fetchTodos();
  }, []);

  const todoFilter = todos.filter(tod => {
    if (filter === FilterType.Active) {
      return !tod.completed;
    }

    if (filter === FilterType.Completed) {
      return tod.completed;
    }

    return true;
  });

  const isCompleted = todos.every(tod => !tod.completed);
  const allCompleted = todos.every(tod => tod.completed);

  const addTodo = (event: FormEvent<HTMLFormElement>) => {
    setCloseInput(false);
    event.preventDefault();
    if (!todo.trim()) {
      setErrorMessage('Title should not be empty');
      setTimeout(() => setErrorMessage(''), 3000);

      return;
    }

    const newTodoId = {
      id: -1,
      userId: USER_ID,
      title: todo.trim(),
      completed: false,
    };

    setTodos(prev => [...prev, newTodoId]);
    addLoadingId(-1);

    postTodo({
      userId: USER_ID,
      title: todo.trim(),
      completed: false,
    })
      .then(newTodo => {
        setTodos(
          prev => prev.map(t => (t.id === -1 ? newTodo : t)), // Заміна тимчасового ID на реальний
        );
        setTodo('');
      })
      .catch(() => {
        setTodos(prevTodos => prevTodos.filter(t => t.id !== -1));
        handleError('Unable to add a todo');
      })
      .finally(() => {
        setCloseInput(true);
      });
  };

  const deleteTodoHandler = (todoId: number) => {
    addLoadingId(todoId);

    deleteTodo(todoId)
      .then(() => {
        setTodos(prevTodos => prevTodos.filter(t => t.id !== todoId));
      })
      .catch(() => handleError('Unable to delete a todo'))
      .finally(() => {
        removeLoadingId(todoId);
      });
  };

  const updateCompleted = (todoItem: Todo) => {
    const { id, completed, userId, title } = todoItem;

    addLoadingId(id);

    updateTodo({
      id: id,
      completed: !completed,
      userId: userId,
      title: title,
    })
      .then(updatedTodo => {
        setTodos(prevTodos =>
          prevTodos.map(t => (t.id === updatedTodo.id ? updatedTodo : t)),
        );
        removeLoadingId(id);
      })
      .catch(() => handleError('Unable to update a todo'));
  };

  const ToggleAllButton = () => {
    const incompleteTodos = todos.filter(tod => !tod.completed);

    const todosToUpdate = incompleteTodos.length > 0 ? incompleteTodos : todos;

    Promise.all(todosToUpdate.map(tod => updateCompleted(tod)));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleBlur = (todoItem: Todo) => {
    if (newTitle.trim() === todoItem.title) {
      setChangeTodoId(null);

      return;
    }

    setChangeTodoId(null);

    updateTodo({
      id: todoItem.id,
      completed: todoItem.completed,
      userId: todoItem.userId,
      title: newTitle,
    })
      .then(updatedTodo => {
        setTodos(prevTodos =>
          prevTodos.map(t => (t.id === updatedTodo.id ? updatedTodo : t)),
        );
      })
      .catch(() => handleError('Unable to update a todo'));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    todoItem: Todo,
  ) => {
    if (e.key === 'Enter') {
      handleBlur(todoItem);
    } else if (e.key === 'Escape') {
      setChangeTodoId(null);
    }
  };

  const handleDoubleClick = (todoItem: Todo) => {
    setNewTitle(todoItem.title);
    setChangeTodoId(todoItem.id);
  };

  const ClearCompleted = () => {
    const completedTodos = todos.filter(tod => tod.completed);

    Promise.all(completedTodos.map(tod => deleteTodoHandler(tod.id)));
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            // className="todoapp__toggle-all active"
            className={`todoapp__toggle-all ${allCompleted ? 'active' : ''}`}
            data-cy="ToggleAllButton"
            onClick={ToggleAllButton}
          />

          <form onSubmit={addTodo}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={todo}
              onChange={e => setTodo(e.target.value)}
              disabled={!closeInput}
              ref={inputRef}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {todoFilter.map(todoItem => (
            <div
              data-cy="Todo"
              key={todoItem.id}
              className={`todo ${todoItem.completed ? 'completed' : ''}`}
              style={{
                opacity: isLoadingIds.includes(todoItem.id) ? 0.75 : 1,
              }}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todoItem.completed}
                  onChange={() => updateCompleted(todoItem)}
                  aria-label={`Mark as ${todoItem.completed ? FilterType.Active : FilterType.Completed}`}
                />
              </label>

              {changeTodoId === todoItem.id ? (
                <input
                  data-cy="TodoEditInput"
                  type="text"
                  className="todo__edit"
                  value={newTitle}
                  onChange={handleChange}
                  onBlur={() => handleBlur(todoItem)}
                  onKeyDown={e => handleKeyDown(e, todoItem)}
                  autoFocus
                />
              ) : (
                <span
                  data-cy="TodoTitle"
                  className="todo__title"
                  onDoubleClick={() => handleDoubleClick(todoItem)}
                >
                  {todoItem.title}
                </span>
              )}

              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
                onClick={() => deleteTodoHandler(todoItem.id)}
              >
                ×
              </button>
            </div>
          ))}
        </section>
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(tod => !tod.completed).length} items left
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filter === FilterType.All ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={() => setFilter(FilterType.All)}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${filter === FilterType.Active ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={() => setFilter(FilterType.Active)}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${filter === FilterType.Completed ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={() => setFilter(FilterType.Completed)}
              >
                Completed
              </a>
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={ClearCompleted}
              disabled={isCompleted}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>
      <ErrorMessage
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
