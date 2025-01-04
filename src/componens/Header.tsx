import React, { FormEvent, useRef, useEffect } from 'react';
import { Todo } from '../types/Todo';
import classNames from 'classnames';

type Props = {
  addTodo: (event: FormEvent<HTMLFormElement>) => void;
  todo: string;
  todos: Todo[];
  setTodo: React.Dispatch<React.SetStateAction<string>>;
  closeInput: boolean;
  updateCompleted: (todoItem: Todo) => void;
};
export const Header: React.FC<Props> = ({
  addTodo,
  todo,
  todos,
  setTodo,
  closeInput,
  updateCompleted,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const allCompleted = todos.every(tod => tod.completed);
  const ToggleAllButton = () => {
    const incompleteTodos = todos.filter(tod => !tod.completed);

    const todosToUpdate = incompleteTodos.length > 0 ? incompleteTodos : todos;

    Promise.all(todosToUpdate.map(tod => updateCompleted(tod)));
  };

  useEffect(() => {
    if (!todo) {
      inputRef.current?.focus();
    }
  }, [todo]);

  return (
    <header className="todoapp__header">
      <button
        type="button"
        className={classNames('todoapp__toggle-all', {
          active: allCompleted && todos.length > 0,
        })}
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
  );
};
