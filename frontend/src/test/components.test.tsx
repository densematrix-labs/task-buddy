import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../components/TaskItem';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import ProgressCard from '../components/ProgressCard';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useStore } from '../hooks/useStore';

// Mock useStore
vi.mock('../hooks/useStore', () => ({
  useStore: vi.fn()
}));

describe('TaskItem', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test description',
    completed: false,
    created_at: '2026-01-01T00:00:00Z',
    subtasks: []
  };

  it('renders task title', () => {
    render(
      <TaskItem task={mockTask} onComplete={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(
      <TaskItem task={mockTask} onComplete={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onComplete when checkbox clicked', () => {
    const onComplete = vi.fn();
    render(
      <TaskItem task={mockTask} onComplete={onComplete} onDelete={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /mark/i }));
    expect(onComplete).toHaveBeenCalledWith(1);
  });

  it('does not call onComplete when already completed', () => {
    const completedTask = { ...mockTask, completed: true };
    const onComplete = vi.fn();
    render(
      <TaskItem task={completedTask} onComplete={onComplete} onDelete={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /completed/i }));
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('TaskInput', () => {
  it('renders input and buttons', () => {
    render(
      <TaskInput onAdd={vi.fn()} onBreakdown={vi.fn()} isLoading={false} />
    );
    expect(screen.getByTestId('task-input')).toBeInTheDocument();
    expect(screen.getByText('task.add')).toBeInTheDocument();
    expect(screen.getByText(/task.breakdown/)).toBeInTheDocument();
  });

  it('calls onAdd when form submitted', () => {
    const onAdd = vi.fn();
    render(
      <TaskInput onAdd={onAdd} onBreakdown={vi.fn()} isLoading={false} />
    );
    const input = screen.getByTestId('task-input');
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.submit(input.closest('form')!);
    expect(onAdd).toHaveBeenCalledWith('New task');
  });

  it('does not call onAdd when input is empty', () => {
    const onAdd = vi.fn();
    render(
      <TaskInput onAdd={onAdd} onBreakdown={vi.fn()} isLoading={false} />
    );
    fireEvent.submit(screen.getByTestId('task-input').closest('form')!);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    render(
      <TaskInput onAdd={vi.fn()} onBreakdown={vi.fn()} isLoading={true} />
    );
    expect(screen.getByText('task.add')).toBeDisabled();
  });
});

describe('TaskList', () => {
  const mockTasks = [
    { id: 1, title: 'Pending Task', completed: false, created_at: '2026-01-01', subtasks: [] },
    { id: 2, title: 'Completed Task', completed: true, created_at: '2026-01-01', subtasks: [] }
  ];

  it('renders empty state when no tasks', () => {
    render(
      <TaskList tasks={[]} onComplete={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText('task.empty')).toBeInTheDocument();
  });

  it('renders pending and completed sections', () => {
    render(
      <TaskList tasks={mockTasks} onComplete={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText('task.pending')).toBeInTheDocument();
    expect(screen.getByText('task.completedSection')).toBeInTheDocument();
  });

  it('renders all tasks', () => {
    render(
      <TaskList tasks={mockTasks} onComplete={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText('Pending Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });
});

describe('ProgressCard', () => {
  it('renders nothing when no progress', () => {
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const { container } = render(<ProgressCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders progress stats', () => {
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      today_completed: 5,
      today_created: 3,
      streak_days: 7,
      total_completed: 100
    });
    render(<ProgressCard />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/7/)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});

describe('LanguageSwitcher', () => {
  it('renders language switcher button', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId('lang-switcher'));
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });
});
