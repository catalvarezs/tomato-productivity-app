import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, Clock } from 'lucide-react';
import { Badge } from '../components/ui';
import { Task, TaskStatus } from '../types';

interface TasksViewProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, setTasks }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: inputValue.trim(),
      status: TaskStatus.TODO,
      createdAt: Date.now(),
      tags: []
    };

    setTasks([newTask, ...tasks]);
    setInputValue('');
  };

  const toggleStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        status: t.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE
      };
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE);

  return (
    <div className="max-w-3xl mx-auto w-full h-full flex flex-col space-y-8 pb-10">
      <header className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Tasks</h2>
        <p className="text-slate-500">Harvest your goals.</p>
      </header>

      {/* Hero Input Section */}
      <div className="w-full relative z-10">
        <form onSubmit={addTask} className="relative group">
            <div 
                className={`
                    flex items-center bg-white rounded-2xl border transition-all duration-300 ease-out relative overflow-hidden
                    ${isFocused ? 'ring-2 ring-[#d62828]/10 border-[#d62828] shadow-lg shadow-[#d62828]/5' : 'border-slate-200 shadow-sm hover:border-slate-300'}
                `}
            >
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="What needs to be done?"
                    className="w-full bg-transparent border-none focus:ring-0 px-14 py-4 text-slate-700 placeholder:text-slate-400 text-center font-medium outline-none transition-all"
                />
                
                {/* Animated Submit Button */}
                <div className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-300 ${inputValue.trim() ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                    <button 
                        type="submit"
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#d62828] text-white hover:bg-[#b91c1c] active:scale-95 transition-all shadow-md shadow-[#d62828]/20"
                        title="Add Task"
                    >
                        <Plus className="w-5 h-5 stroke-[3px]" />
                    </button>
                </div>
            </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-1">
        {/* Pending Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">In Progress</h3>
            <Badge color="red">{pendingTasks.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {pendingTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 text-slate-400">
                <div className="p-3 bg-white rounded-full mb-3 shadow-sm">
                    <CheckSquare className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium">No pending tasks.</p>
                <p className="text-xs opacity-70">Enjoy the quiet or add a new goal.</p>
              </div>
            )}
            {pendingTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={() => toggleStatus(task.id)} onDelete={() => deleteTask(task.id)} />
            ))}
          </div>
        </section>

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 px-1 mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ripe & Ready</h3>
              <Badge color="green">{completedTasks.length}</Badge>
            </div>
            <div className="space-y-3 opacity-90">
              {completedTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={() => toggleStatus(task.id)} onDelete={() => deleteTask(task.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: Task; onToggle: () => void; onDelete: () => void }> = ({ task, onToggle, onDelete }) => {
  const isDone = task.status === TaskStatus.DONE;

  return (
    <div className={`group bg-white rounded-xl border p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md ${isDone ? 'border-slate-100 bg-slate-50/50' : 'border-slate-100 hover:border-[#d62828]/20'}`}>
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <button 
          onClick={onToggle}
          className={`flex-shrink-0 transition-all duration-200 transform active:scale-90 ${isDone ? 'text-[#d62828]' : 'text-slate-300 hover:text-[#d62828]'}`}
        >
          {isDone ? <CheckSquare className="w-6 h-6 stroke-[2.5px]" /> : <Square className="w-6 h-6 stroke-2" />}
        </button>
        <span className={`text-sm font-medium truncate transition-all duration-200 ${isDone ? 'text-slate-500' : 'text-slate-700'}`}>
          {task.title}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="hidden sm:flex text-[10px] text-slate-400 items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100 whitespace-nowrap">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
        </span>
        <button 
          onClick={onDelete}
          className="p-2 text-slate-400 hover:text-[#d62828] hover:bg-[#d62828]/10 rounded-lg transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};