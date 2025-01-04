import { FilterType } from '../types/FilterType';
import { Todo } from '../types/Todo';
import classNames from 'classnames';

type Props = {
  todos: Todo[];
  filter: FilterType;
  setFilter: (value: FilterType) => void;
  deleteTodoHandler: (todoId: number) => void;
};

export const Footer: React.FC<Props> = ({
  todos,
  filter,
  setFilter,
  deleteTodoHandler,
}) => {
  const clearCompleted = () => {
    const completedTodos = todos.filter(tod => tod.completed);

    Promise.all(completedTodos.map(tod => deleteTodoHandler(tod.id)));
  };

  const isCompleted = todos.every(tod => !tod.completed);

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {todos.filter(tod => !tod.completed).length} items left
      </span>

      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={classNames('filter__link', {
            selected: filter === FilterType.All,
          })}
          data-cy="FilterLinkAll"
          onClick={() => setFilter(FilterType.All)}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: filter === FilterType.Active,
          })}
          data-cy="FilterLinkActive"
          onClick={() => setFilter(FilterType.Active)}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: filter === FilterType.Completed,
          })}
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
        onClick={clearCompleted}
        disabled={isCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};
