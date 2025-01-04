import { Todo } from '../types/Todo';
import classNames from 'classnames';

type Props = {
  todoItem: Todo;
  updateCompleted: (todoItem: Todo) => void;
  isLoadingIds: number[];
  changeTodoId: number | null;
  newTitle: string;
  setNewTitle: (e: string) => void;
  handleDoubleClick: (todoItem: Todo) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    todoItem: Todo,
  ) => void;
  handleBlur: (todoItem: Todo) => void;
  deleteTodoHandler: (todoId: number) => void;
  activeLoader: boolean;
};
export const TodoItem: React.FC<Props> = ({
  todoItem,
  updateCompleted,
  isLoadingIds,
  changeTodoId,
  newTitle,
  setNewTitle,
  handleDoubleClick,
  handleKeyDown,
  handleBlur,
  deleteTodoHandler,
  activeLoader,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  return (
    <div
      data-cy="Todo"
      key={todoItem.id}
      className={classNames('todo', { completed: todoItem.completed })}
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
        />
      </label>

      {changeTodoId === todoItem.id ? (
        <input
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

      {activeLoader && (
        <div data-cy="TodoLoader" className="modal overlay">
          <div className="modal-background has-background-white-ter"></div>
          <div className="loader"></div>
        </div>
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
  );
};
