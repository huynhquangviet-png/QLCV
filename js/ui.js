/* ui.js */

// ==================== 1. TOAST NOTIFICATIONS (Cảnh báo & Thông báo) ====================
/**
 * Hiển thị thông báo Toast góc màn hình
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung chi tiết
 * @param {string} type - Phân loại ('success', 'warning', 'danger', 'info')
 */
function showToast(title, message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;

  // SVG Icons based on type
  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else if (type === "warning") {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else if (type === "danger") {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close-btn" aria-label="Đóng">&times;</button>
  `;

  container.appendChild(toast);

  // Close toast on click close
  toast.querySelector(".toast-close-btn").addEventListener("click", () => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 250);
  });

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 250);
    }
  }, 4500);
}

// ==================== 2. DASHBOARD VIEW RENDERER (Trang chủ) ====================
function renderDashboardView(state) {
  const allPersonal = state.personalTasks;
  const allKanban = state.kanbanTasks;
  const combinedTasks = [...allPersonal, ...allKanban];

  // 1. Tính toán số liệu thống kê
  const total = combinedTasks.length;
  const completed = combinedTasks.filter(t => t.completed || t.status === "done").length;
  const inProgress = allPersonal.filter(t => !t.completed).length + allKanban.filter(t => t.status !== "done" && t.status !== "backlog").length;
  
  // Urgent: Kanban status !== done và priority === urgent hoặc high + cá nhân priority === high và chưa xong
  const urgent = allPersonal.filter(t => !t.completed && t.priority === "high").length + 
                 allKanban.filter(t => t.status !== "done" && (t.priority === "urgent" || t.priority === "high")).length;

  const compPercentage = total > 0 ? (completed / total) * 100 : 0;

  // Cập nhật DOM Stats
  document.getElementById("stats-total").textContent = total;
  document.getElementById("stats-completed").textContent = completed;
  document.getElementById("stats-completed-sub").textContent = `${Math.round(compPercentage)}% Tỉ lệ đạt được`;
  document.getElementById("stats-pending").textContent = inProgress;
  document.getElementById("stats-urgent").textContent = urgent;

  // 2. Render Biểu đồ tròn và Biểu đồ cột SVG
  const activeRangeBtn = document.querySelector(".toggle-filter-btn.active");
  const range = activeRangeBtn ? activeRangeBtn.getAttribute("data-range") : "week";
  
  drawDonutChart("donut-chart-container", compPercentage);
  drawBarChart("bar-chart-container", range, combinedTasks);

  // 3. Render danh sách công việc khẩn cấp (Personal High & Kanban Urgent/High)
  const urgentListContainer = document.getElementById("dashboard-urgent-list");
  urgentListContainer.innerHTML = "";

  const urgentPersonal = allPersonal.filter(t => !t.completed && t.priority === "high").map(t => ({...t, type: "personal"}));
  const urgentKanban = allKanban.filter(t => t.status !== "done" && (t.priority === "urgent" || t.priority === "high")).map(t => ({...t, type: "kanban"}));
  const urgentTasksCombined = [...urgentPersonal, ...urgentKanban].slice(0, 3); // Lấy tối đa 3 tác vụ khẩn cấp nhất

  if (urgentTasksCombined.length === 0) {
    urgentListContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-light); padding: 32px 0; font-size: 13.5px;">
        Thật tuyệt! Không có công việc khẩn cấp nào chưa giải quyết.
      </div>
    `;
  } else {
    urgentTasksCombined.forEach(task => {
      const isPersonal = task.type === "personal";
      const badgeClass = task.priority === "urgent" ? "priority-high" : "priority-medium";
      const badgeText = task.priority === "urgent" ? "Khẩn cấp" : "Cao";
      const subtitle = isPersonal ? `Cá nhân | Hộp thư` : `Tổ chức | ${state.workspaces.find(w => w.id === task.workspaceId)?.name || 'Dự án'}`;

      const card = document.createElement("div");
      card.className = "task-row";
      card.style.padding = "12px 16px";
      card.innerHTML = `
        <div class="task-row-left">
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--danger);"></div>
          <div class="task-details">
            <span class="task-title" style="font-size:13.5px;">${task.title}</span>
            <div class="task-meta">
              <span class="task-meta-item">${subtitle}</span>
              <span class="task-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Hạn: ${formatDate(task.dueDate)}
              </span>
            </div>
          </div>
        </div>
        <div class="task-row-right">
          <span class="priority-badge ${badgeClass}">${badgeText}</span>
        </div>
      `;
      urgentListContainer.appendChild(card);
    });
  }

  // 4. Render mật độ công việc phòng ban (Workspace bars)
  const workspaceBarsContainer = document.getElementById("workspace-stats-bars");
  workspaceBarsContainer.innerHTML = "";

  state.workspaces.forEach(ws => {
    const wsTasks = allKanban.filter(t => t.workspaceId === ws.id);
    const wsTotal = wsTasks.length;
    const wsCompleted = wsTasks.filter(t => t.status === "done").length;
    const wsPercentage = wsTotal > 0 ? (wsCompleted / wsTotal) * 100 : 0;

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.flexDirection = "column";
    row.style.gap = "8px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px;">
        <span style="font-weight:600; color: var(--text-main); display:flex; align-items:center; gap: 8px;">
          <span style="width:10px; height:10px; border-radius:50%; background-color:${ws.color};"></span>
          ${ws.name}
        </span>
        <span style="font-weight:700; color: var(--text-muted);">${wsCompleted}/${wsTotal} Việc (${Math.round(wsPercentage)}%)</span>
      </div>
      <!-- Custom Progress Bar -->
      <div style="width:100%; height:8px; background-color: var(--border-color); border-radius: 4px; overflow:hidden;">
        <div style="width:${wsPercentage}%; height:100%; background-color:${ws.color}; border-radius:4px; transition: width 0.6s ease;"></div>
      </div>
    `;
    workspaceBarsContainer.appendChild(row);
  });
}

// ==================== 3. PERSONAL TASKS VIEW RENDERER (Cá nhân) ====================
function renderPersonalView(state, filterType = "inbox", customProjectId = null) {
  const container = document.getElementById("personal-tasks-container");
  if (!container) return;

  container.innerHTML = "";

  // 1. Cập nhật Số lượng Badge trên Sidebar cá nhân
  const inboxCount = state.personalTasks.length;
  const todayCount = state.personalTasks.filter(t => !t.completed && t.dueDate === getTodayString()).length;
  const upcomingCount = state.personalTasks.filter(t => !t.completed && t.dueDate > getTodayString()).length;
  const importantCount = state.personalTasks.filter(t => !t.completed && t.priority === "high").length;

  document.getElementById("badge-inbox").textContent = inboxCount;
  document.getElementById("badge-today").textContent = todayCount;
  document.getElementById("badge-upcoming").textContent = upcomingCount;
  document.getElementById("badge-important").textContent = importantCount;

  // 2. Render danh sách Custom Projects sidebar
  const projectsListUl = document.getElementById("personal-projects-list");
  projectsListUl.innerHTML = "";
  
  state.personalProjects.forEach(proj => {
    const projTasksCount = state.personalTasks.filter(t => t.projectId === proj.id).length;
    const li = document.createElement("li");
    li.className = `category-link ${customProjectId === proj.id ? 'active' : ''}`;
    li.setAttribute("data-personal-project-id", proj.id);
    li.innerHTML = `
      <div class="category-info">
        <span class="project-bullet" style="background-color: ${proj.color || 'var(--primary)'}"></span>
        <span>${proj.name}</span>
      </div>
      <span class="category-badge">${projTasksCount}</span>
    `;
    projectsListUl.appendChild(li);
  });

  // 3. Lọc danh sách công việc hiển thị
  let filteredTasks = [];
  let title = "Hộp thư đến";
  let subtitle = "Tất cả công việc cá nhân của bạn.";

  if (customProjectId) {
    const targetProject = state.personalProjects.find(p => p.id === customProjectId);
    filteredTasks = state.personalTasks.filter(t => t.projectId === customProjectId);
    title = targetProject ? targetProject.name : "Danh mục cá nhân";
    subtitle = `Dự án cá nhân chứa ${filteredTasks.length} tác vụ.`;
  } else {
    if (filterType === "inbox") {
      filteredTasks = state.personalTasks;
      title = "Hộp thư đến";
      subtitle = "Xem toàn bộ các công việc cá nhân của bạn.";
    } else if (filterType === "today") {
      filteredTasks = state.personalTasks.filter(t => t.dueDate === getTodayString());
      title = "Việc hôm nay";
      subtitle = "Tập trung giải quyết các công việc trong ngày.";
    } else if (filterType === "upcoming") {
      filteredTasks = state.personalTasks.filter(t => t.dueDate > getTodayString());
      title = "Sắp diễn ra";
      subtitle = "Chuẩn bị trước kế hoạch cho các ngày tiếp theo.";
    } else if (filterType === "important") {
      filteredTasks = state.personalTasks.filter(t => t.priority === "high");
      title = "Quan trọng & Ưu tiên";
      subtitle = "Việc khẩn và cấp bách cần giải quyết trước.";
    }
  }

  // Cập nhật Tiêu đề trang
  document.getElementById("personal-list-title").textContent = title;
  document.getElementById("personal-list-subtitle").textContent = subtitle;

  // 4. Vẽ danh sách các hàng công việc (Task rows)
  if (filteredTasks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-light); padding: 48px 0;">
        <svg xmlns="http://www.w3.org/2000/svg" style="width:48px; height:48px; stroke: currentColor; fill:none; stroke-width: 1.5; margin-bottom: 12px;" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <p style="font-size:14px; font-weight:550;">Không tìm thấy công việc nào!</p>
        <p style="font-size:12.5px; color: var(--text-light); margin-top:4px;">Nhấp vào nút "Thêm việc mới" để ghi lại các mục tiêu cá nhân.</p>
      </div>
    `;
    return;
  }

  // Sắp xếp: chưa hoàn thành trước, đã xong sau, trong đó sắp theo ngày hết hạn
  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  filteredTasks.forEach(task => {
    const isOverdue = !task.completed && task.dueDate < getTodayString();
    const dateLabelColor = isOverdue ? "var(--danger)" : "var(--text-muted)";
    const priorityClass = task.priority === "high" ? "priority-high" : (task.priority === "medium" ? "priority-medium" : "priority-low");
    const priorityText = task.priority === "high" ? "Cao" : (task.priority === "medium" ? "Trung bình" : "Thấp");

    const row = document.createElement("div");
    row.className = `task-row ${task.completed ? 'completed' : ''}`;
    row.setAttribute("data-personal-task-id", task.id);

    // Render tags
    const tagsHtml = (task.tags || []).map(tg => `<span class="task-tag">${tg}</span>`).join(" ");

    row.innerHTML = `
      <div class="task-row-left">
        <label class="task-checkbox-container">
          <input type="checkbox" class="task-checkbox-input" ${task.completed ? 'checked' : ''}>
          <span class="task-checkbox-custom"></span>
        </label>
        <div class="task-details">
          <span class="task-title">${task.title}</span>
          <div class="task-meta">
            <span class="task-meta-item" style="color: ${dateLabelColor}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Hạn chót: ${formatDate(task.dueDate)} ${isOverdue ? '(Quá hạn)' : ''}
            </span>
            ${task.projectId !== "inbox" ? `
              <span class="task-meta-item">
                <span class="project-bullet" style="background-color:${state.personalProjects.find(p => p.id === task.projectId)?.color || '#94a3b8'}; width:8px; height:8px;"></span>
                ${state.personalProjects.find(p => p.id === task.projectId)?.name || ''}
              </span>
            ` : ''}
            ${tagsHtml}
          </div>
        </div>
      </div>
      <div class="task-row-right">
        <span class="priority-badge ${priorityClass}">${priorityText}</span>
        <button class="action-icon-btn edit-btn" title="Chỉnh sửa"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg></button>
        <button class="action-icon-btn delete-btn" title="Xóa"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
      </div>
    `;

    // Lắng nghe sự kiện checkbox hoàn thành nhanh
    row.querySelector(".task-checkbox-input").addEventListener("change", (e) => {
      task.completed = e.target.checked;
      if (task.completed) {
        row.classList.add("completed");
        showToast("Hoàn thành công việc", `Bạn đã xong: "${task.title}"`, "success");
      } else {
        row.classList.remove("completed");
      }
      saveData();
      // Render lại Dashboard ở chế độ ngầm để đồng bộ
      renderDashboardView(state);
    });

    // Lắng nghe nút Sửa & Xóa
    row.querySelector(".edit-btn").addEventListener("click", () => {
      openPersonalTaskModal(task);
    });

    row.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm(`Bạn chắc chắn muốn xóa công việc cá nhân: "${task.title}"?`)) {
        state.personalTasks = state.personalTasks.filter(t => t.id !== task.id);
        saveData();
        renderPersonalView(state, filterType, customProjectId);
        renderDashboardView(state);
        showToast("Đã xóa", "Đã gỡ bỏ công việc cá nhân thành công.", "success");
      }
    });

    container.appendChild(row);
  });
}

// ==================== 4. TEAM KANBAN BOARD RENDERER (Bảng Kanban nhóm) ====================
function renderKanbanView(state) {
  const select = document.getElementById("kanban-workspace-select");
  if (!select) return;

  // 1. Nạp danh sách Phòng ban vào selector (chỉ làm một lần hoặc làm mới khi đổi)
  const currentSelectedWsId = select.value || state.workspaces[0]?.id;
  select.innerHTML = "";
  state.workspaces.forEach(ws => {
    const opt = document.createElement("option");
    opt.value = ws.id;
    opt.textContent = ws.name;
    if (ws.id === currentSelectedWsId) opt.selected = true;
    select.appendChild(opt);
  });

  // 2. Định nghĩa 5 cột trạng thái tiêu chuẩn
  const columnsData = [
    { key: "backlog", name: "Yêu cầu (Backlog)", color: "#94a3b8" }, // Slate
    { key: "todo", name: "Cần làm (To Do)", color: "#3b82f6" }, // Blue
    { key: "in_progress", name: "Đang làm (In Progress)", color: "#f59e0b" }, // Amber
    { key: "in_review", name: "Kiểm tra (In Review)", color: "#a855f7" }, // Purple
    { key: "done", name: "Hoàn thành (Done)", color: "#10b981" } // Emerald
  ];

  const boardContainer = document.getElementById("kanban-columns-container");
  boardContainer.innerHTML = "";

  const activeTasks = state.kanbanTasks.filter(t => t.workspaceId === currentSelectedWsId);

  columnsData.forEach(col => {
    const colTasks = activeTasks.filter(t => t.status === col.key);

    const columnDiv = document.createElement("div");
    columnDiv.className = "kanban-column";

    columnDiv.innerHTML = `
      <div class="kanban-column-header">
        <span style="display:flex; align-items:center;">
          <span class="kanban-column-indicator" style="background-color: ${col.color};"></span>
          ${col.name}
        </span>
        <span class="kanban-column-count">${colTasks.length}</span>
      </div>
      <div class="kanban-cards-container" data-status-column="${col.key}">
        <!-- Thẻ công việc nhóm -->
      </div>
    `;

    const cardsContainer = columnDiv.querySelector(".kanban-cards-container");

    if (colTasks.length === 0) {
      cardsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-light); padding: 24px 0; font-size: 11.5px; pointer-events:none;">
          Trống
        </div>
      `;
    } else {
      colTasks.forEach(task => {
        const isOverdue = task.status !== "done" && task.dueDate < getTodayString();
        const dateBorderColor = isOverdue ? "1px solid var(--danger)" : "1px solid var(--card-border)";
        const dateTextColor = isOverdue ? "var(--danger)" : "var(--text-muted)";
        const priorityClass = task.priority === "urgent" ? "priority-high" : (task.priority === "high" ? "priority-high" : (task.priority === "medium" ? "priority-medium" : "priority-low"));
        const priorityLabel = task.priority === "urgent" ? "Cấp bách" : (task.priority === "high" ? "Cao" : (task.priority === "medium" ? "T.Bình" : "Thấp"));

        const card = document.createElement("div");
        card.className = "kanban-card";
        card.setAttribute("draggable", "true");
        card.setAttribute("data-kanban-task-id", task.id);
        if (isOverdue) card.style.borderLeft = "4px solid var(--danger)";

        // Build assignees avatars
        let avatarsHtml = "";
        const maxAvatars = 3;
        const taskAssignees = state.members.filter(m => task.assigneeIds.includes(m.id));
        
        taskAssignees.slice(0, maxAvatars).forEach(m => {
          avatarsHtml += `<img src="${m.avatar}" alt="${m.name}" title="${m.name} - ${m.role}" class="stacked-avatar">`;
        });
        
        if (taskAssignees.length > maxAvatars) {
          avatarsHtml += `<span class="stacked-avatar-more">+${taskAssignees.length - maxAvatars}</span>`;
        }

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="kanban-card-project">${task.projectTag}</span>
            <span class="priority-badge ${priorityClass}">${priorityLabel}</span>
          </div>
          <h4 class="kanban-card-title">${task.title}</h4>
          <p class="kanban-card-desc">${task.desc || 'Không có mô tả chi tiết.'}</p>
          
          <div class="kanban-card-footer">
            <div class="task-meta-item" style="color: ${dateTextColor}; font-weight:600;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:12px; height:12px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Hạn: ${formatDate(task.dueDate)}
            </div>
            <div class="member-avatars">
              ${avatarsHtml}
            </div>
          </div>
        `;

        // Click card to open Details Modal
        card.addEventListener("click", (e) => {
          // Avoid opening modal if they clicked on some button (if we add any later)
          openKanbanDetailModal(task, state);
        });

        // HTML5 dragstart listener
        card.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", task.id);
          card.style.opacity = "0.5";
        });

        card.addEventListener("dragend", () => {
          card.style.opacity = "1";
        });

        cardsContainer.appendChild(card);
      });
    }

    // Drag over column container listener
    cardsContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      cardsContainer.classList.add("drag-over");
    });

    cardsContainer.addEventListener("dragleave", () => {
      cardsContainer.classList.remove("drag-over");
    });

    // Drop task card on column
    cardsContainer.addEventListener("drop", (e) => {
      e.preventDefault();
      cardsContainer.classList.remove("drag-over");
      
      const taskId = e.dataTransfer.getData("text/plain");
      const task = state.kanbanTasks.find(t => t.id === taskId);
      
      if (task) {
        const newStatus = col.key;
        
        // KIỂM TRA PHÂN QUYỀN
        const check = checkPermission("move_task", task);
        if (!check.granted) {
          showToast("Từ chối quyền hạn", check.reason, "danger");
          return;
        }

        if (task.status !== newStatus) {
          const oldStatusName = columnsData.find(c => c.key === task.status)?.name || task.status;
          task.status = newStatus;
          
          // Log activity
          const currentUser = ROLES[state.currentRole];
          const logText = `${currentUser.name} đã chuyển trạng thái từ '${oldStatusName}' sang '${col.name}'`;
          task.activities.unshift({
            text: logText,
            time: new Date().toISOString()
          });

          saveData();
          renderKanbanView(state);
          renderDashboardView(state);
          showToast("Cập nhật thành công", `Đã chuyển công việc sang "${col.name}"`, "success");
        }
      }
    });

    boardContainer.appendChild(columnDiv);
  });
}

// ==================== 5. CALENDAR VIEW RENDERER (Lịch biểu) ====================
let currentCalendarDate = new Date(); // To track calendar month view

function renderCalendarView(state) {
  const grid = document.getElementById("calendar-days-grid");
  const monthYearLabel = document.getElementById("calendar-month-year");
  if (!grid || !monthYearLabel) return;

  grid.innerHTML = "";

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth(); // 0-11

  // Set Vietnamese month names
  const vietnameseMonths = [
    "Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
    "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"
  ];
  monthYearLabel.textContent = `${vietnameseMonths[month]}, Năm ${year}`;

  // 1. Thêm nhãn cột Thứ 2 -> Chủ nhật
  const dayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  dayLabels.forEach(lbl => {
    const lblDiv = document.createElement("div");
    lblDiv.className = "calendar-day-label";
    lblDiv.textContent = lbl;
    grid.appendChild(lblDiv);
  });

  // 2. Tìm ngày đầu tiên của tháng, ngày cuối cùng
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Chuyển đổi chỉ mục ngày (0 - Chủ Nhật) sang chuẩn 7 cột: Thứ hai ở đầu (index 0), Chủ nhật ở cuối (index 6)
  const emptyStartCells = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // 3. Render các ngày của tháng trước (mờ)
  for (let i = emptyStartCells - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const cell = document.createElement("div");
    cell.className = "calendar-day prev-month";
    cell.innerHTML = `<span>${day}</span>`;
    grid.appendChild(cell);
  }

  // 4. Render các ngày của tháng hiện tại
  let selectedDateCell = null;
  const todayString = getTodayString();
  const todayParts = todayString.split("-");
  const isCurrentMonthYear = parseInt(todayParts[0]) === year && parseInt(todayParts[1]) - 1 === month;

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    
    // Kiểm tra xem có trùng ngày hôm nay không
    const isToday = isCurrentMonthYear && parseInt(todayParts[2]) === day;
    if (isToday) cell.classList.add("today");

    // Tạo chuỗi ngày định dạng YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cell.setAttribute("data-calendar-date", dateStr);

    // Tính toán công việc có trong ngày đó để vẽ chấm màu
    const dayPersonal = state.personalTasks.filter(t => t.dueDate === dateStr);
    const dayKanban = state.kanbanTasks.filter(t => t.dueDate === dateStr);
    const dayCombined = [...dayPersonal, ...dayKanban];

    let dotsHtml = "";
    if (dayCombined.length > 0) {
      dotsHtml += '<div class="calendar-tasks-dots">';
      // Cá nhân: chấm màu xanh lam, nhóm: chấm màu indigo, quá hạn/khẩn cấp: chấm màu đỏ
      const hasUrgent = dayCombined.some(t => t.priority === "urgent" || t.priority === "high");
      
      if (hasUrgent) {
        dotsHtml += '<span class="calendar-task-dot" style="background-color: var(--danger);"></span>';
      }
      if (dayPersonal.length > 0) {
        dotsHtml += '<span class="calendar-task-dot" style="background-color: var(--info);"></span>';
      }
      if (dayKanban.length > 0) {
        dotsHtml += '<span class="calendar-task-dot" style="background-color: var(--primary);"></span>';
      }
      dotsHtml += '</div>';
    }

    cell.innerHTML = `
      <span>${day}</span>
      ${dotsHtml}
    `;

    // Click ngày để xem danh sách công việc ở panel bên dưới
    cell.addEventListener("click", () => {
      // Remove class active từ ngày trước đó
      const prevActive = grid.querySelector(".calendar-day.active");
      if (prevActive) {
        prevActive.classList.remove("active");
        prevActive.style.borderColor = "var(--card-border)";
        prevActive.style.boxShadow = "none";
      }
      
      cell.classList.add("active");
      cell.style.borderColor = "var(--primary)";
      cell.style.boxShadow = "0 0 0 2px var(--primary-light)";
      
      renderDayTasksInCalendar(dateStr, state);
    });

    grid.appendChild(cell);

    // Mặc định tự động click ngày hôm nay khi render lần đầu
    if (isToday) {
      selectedDateCell = cell;
    }
  }

  // 5. Render các ngày của tháng sau (mờ)
  const totalCellsSoFar = emptyStartCells + daysInMonth;
  const remainingCells = 42 - totalCellsSoFar; // Grid 6 dòng = 42 ô
  for (let day = 1; day <= remainingCells; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day next-month";
    cell.innerHTML = `<span>${day}</span>`;
    grid.appendChild(cell);
  }

  // Tự kích hoạt hiển thị cho ngày hôm nay
  if (selectedDateCell) {
    selectedDateCell.click();
  } else {
    // Nếu tháng hiển thị không chứa ngày hôm nay, click ngày 1 của tháng đó
    const firstActive = grid.querySelector(`.calendar-day[data-calendar-date]`);
    if (firstActive) firstActive.click();
  }
}

/**
 * Render danh sách công việc có thời hạn trong ngày đã chọn trên Calendar
 */
function renderDayTasksInCalendar(dateStr, state) {
  const title = document.getElementById("calendar-selected-day-title");
  const listContainer = document.getElementById("calendar-day-tasks-list");
  if (!title || !listContainer) return;

  const formattedDate = formatDate(dateStr);
  title.textContent = `Danh sách công việc hết hạn ngày ${formattedDate}`;

  listContainer.innerHTML = "";

  const dayPersonal = state.personalTasks.filter(t => t.dueDate === dateStr).map(t => ({...t, type: "personal"}));
  const dayKanban = state.kanbanTasks.filter(t => t.workspaceId && t.dueDate === dateStr).map(t => ({...t, type: "kanban"}));
  const dayCombined = [...dayPersonal, ...dayKanban];

  if (dayCombined.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-light); padding: 32px 0; font-size: 13.5px;">
        Không có công việc nào hết hạn trong ngày này.
      </div>
    `;
    return;
  }

  dayCombined.forEach(task => {
    const isPersonal = task.type === "personal";
    const statusText = isPersonal ? (task.completed ? "Hoàn thành" : "Chờ làm") : (task.status === "done" ? "Hoàn thành" : "Đang xử lý");
    const priorityClass = task.priority === "urgent" ? "priority-high" : (task.priority === "high" ? "priority-high" : (task.priority === "medium" ? "priority-medium" : "priority-low"));
    const priorityLabel = task.priority === "urgent" ? "Cấp bách" : (task.priority === "high" ? "Cao" : (task.priority === "medium" ? "T.Bình" : "Thấp"));
    const subtitle = isPersonal ? `Cá nhân | Hộp thư` : `Tổ chức | ${state.workspaces.find(w => w.id === task.workspaceId)?.name || 'Dự án'}`;

    const card = document.createElement("div");
    card.className = `task-row ${task.completed || task.status === 'done' ? 'completed' : ''}`;
    card.style.padding = "12px 16px";
    card.innerHTML = `
      <div class="task-row-left">
        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${isPersonal ? 'var(--info)' : 'var(--primary)'};"></div>
        <div class="task-details">
          <span class="task-title" style="font-size:13.5px;">${task.title}</span>
          <div class="task-meta">
            <span class="task-meta-item">${subtitle}</span>
            <span class="task-meta-item">Trạng thái: <strong>${statusText}</strong></span>
          </div>
        </div>
      </div>
      <div class="task-row-right">
        <span class="priority-badge ${priorityClass}">${priorityLabel}</span>
      </div>
    `;
    listContainer.appendChild(card);
  });
}

// ==================== 6. MODALS DETAILS (Kanban detailed modal & Comments) ====================
let currentViewingKanbanTask = null;

function openKanbanDetailModal(task, state) {
  currentViewingKanbanTask = task;
  const modal = document.getElementById("kanban-detail-modal");
  if (!modal) return;

  // Cập nhật thông tin chi tiết
  document.getElementById("detail-project-tag").textContent = task.projectTag;
  document.getElementById("detail-title").textContent = task.title;
  document.getElementById("detail-desc").textContent = task.desc || "Không có mô tả chi tiết yêu cầu.";
  document.getElementById("detail-due-date").textContent = formatDate(task.dueDate);

  // Độ ưu tiên badge
  const priorityBadge = document.getElementById("detail-priority-badge");
  priorityBadge.className = `priority-badge priority-${task.priority === 'urgent' ? 'high' : task.priority}`;
  priorityBadge.textContent = task.priority === 'urgent' ? 'Cấp bách' : (task.priority === 'high' ? 'Cao' : (task.priority === 'medium' ? 'T.Bình' : 'Thấp'));

  // Người thực hiện avatars
  const membersContainer = document.getElementById("detail-members-container");
  membersContainer.innerHTML = "";
  const taskAssignees = state.members.filter(m => task.assigneeIds.includes(m.id));

  if (taskAssignees.length === 0) {
    membersContainer.textContent = "Chưa có ai thực hiện";
  } else {
    taskAssignees.forEach(m => {
      const box = document.createElement("div");
      box.style.display = "flex";
      box.style.alignItems = "center";
      box.style.gap = "6px";
      box.style.backgroundColor = "var(--card-bg)";
      box.style.padding = "4px 8px";
      box.style.borderRadius = "var(--radius-sm)";
      box.style.border = "1px solid var(--card-border)";
      box.innerHTML = `
        <img src="${m.avatar}" alt="${m.name}" style="width:20px; height:20px; border-radius:50%; object-fit:cover;">
        <span style="font-size:11.5px; font-weight:600;">${m.name}</span>
      `;
      membersContainer.appendChild(box);
    });
  }

  // Comments
  renderKanbanComments(task, state);
  
  // Activity log
  renderKanbanActivities(task);

  // Show modal
  modal.classList.add("open");
}

function renderKanbanComments(task, state) {
  const list = document.getElementById("detail-comments-list");
  const count = document.getElementById("comments-count");
  if (!list || !count) return;

  list.innerHTML = "";
  const comments = task.comments || [];
  count.textContent = `${comments.length} bình luận`;

  if (comments.length === 0) {
    list.innerHTML = `<div style="text-align: center; color: var(--text-light); padding: 12px; font-size:12px;">Chưa có thảo luận nào. Hãy gửi bình luận đầu tiên!</div>`;
    return;
  }

  comments.forEach(c => {
    const author = state.members.find(m => m.id === c.authorId) || { name: c.authorName, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100" };
    const dateFormatted = new Date(c.time).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });

    const item = document.createElement("div");
    item.className = "comment-item";
    item.innerHTML = `
      <img src="${author.avatar}" alt="${author.name}" class="comment-author-avatar">
      <div class="comment-content-box">
        <div class="comment-author-info">
          <span class="comment-author-name">${author.name}</span>
          <span class="comment-time">${dateFormatted}</span>
        </div>
        <div class="comment-text">${c.text}</div>
      </div>
    `;
    list.appendChild(item);
  });

  // Auto scroll down to the last comment
  setTimeout(() => {
    list.scrollTop = list.scrollHeight;
  }, 100);
}

function renderKanbanActivities(task) {
  const list = document.getElementById("detail-activity-list");
  if (!list) return;

  list.innerHTML = "";
  const acts = task.activities || [];

  if (acts.length === 0) {
    list.innerHTML = `<div style="color:var(--text-light)">Chưa có nhật ký hoạt động.</div>`;
    return;
  }

  acts.forEach(act => {
    const timeFormatted = new Date(act.time).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
      <span class="activity-dot"></span>
      <span style="font-weight:600; color:var(--text-main); margin-right:4px;">${timeFormatted}:</span>
      <span>${act.text}</span>
    `;
    list.appendChild(item);
  });
}

// ==================== 7. HELPER UTILS (Date formatters, strings) ====================
function getTodayString() {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; // Offset in milliseconds
  const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
  return localISOTime;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// ==================== 8. MEMBERS & PERMISSIONS VIEW RENDERER (Thành viên & Phân quyền) ====================
function renderMembersView(state) {
  const listContainer = document.getElementById("members-list-container");
  const matrixContainer = document.getElementById("permissions-matrix-tbody");
  if (!listContainer || !matrixContainer) return;

  // 1. RENDER LEFT COLUMN: MEMBERS LIST
  listContainer.innerHTML = "";
  state.members.forEach(m => {
    const card = document.createElement("div");
    card.className = "task-row";
    card.style.padding = "12px 16px";
    
    // Kiểm tra xem có trùng vai trò đang dùng để giả lập không (Không cho tự xóa chính mình)
    const isSelfSimulated = ROLES[state.currentRole]?.memberId === m.id;
    
    card.innerHTML = `
      <div class="task-row-left">
        <img src="${m.avatar}" alt="${m.name}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">
        <div class="task-details">
          <span class="task-title" style="font-size: 14px; font-weight: 700;">${m.name}</span>
          <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 550;">${m.role}</span>
        </div>
      </div>
      <div class="task-row-right">
        <button class="action-icon-btn edit-member-btn" title="Chỉnh sửa"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:16px; height:16px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg></button>
        <button class="action-icon-btn delete-member-btn" title="Xóa" ${isSelfSimulated ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:16px; height:16px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
      </div>
    `;

    // Sự kiện Sửa thành viên
    card.querySelector(".edit-member-btn").addEventListener("click", () => {
      openMemberFormModal(m);
    });

    // Sự kiện Xóa thành viên
    if (!isSelfSimulated) {
      card.querySelector(".delete-member-btn").addEventListener("click", () => {
        if (confirm(`Bạn chắc chắn muốn xóa thành viên "${m.name}"? Nhân sự này sẽ bị rút khỏi tất cả các công việc nhóm đang phụ trách.`)) {
          
          // Dọn dẹp phân công công việc tổ chức để tránh mồ côi
          state.kanbanTasks.forEach(task => {
            task.assigneeIds = task.assigneeIds.filter(id => id !== m.id);
          });

          // Xóa khỏi danh sách thành viên
          state.members = state.members.filter(member => member.id !== m.id);
          
          saveData();
          renderMembersView(state);
          renderKanbanView(state); // Cập nhật lại avatars tròn xếp chồng ở tab Kanban
          renderDashboardView(state); // Cập nhật các chỉ số tổng quan ở trang chủ
          
          showToast("Đã xóa nhân sự", `Thành viên "${m.name}" đã được gỡ khỏi hệ thống thành công.`, "success");
        }
      });
    }

    listContainer.appendChild(card);
  });

  // 2. RENDER RIGHT COLUMN: PERMISSION MATRIX TABLE
  matrixContainer.innerHTML = "";

  const actions = [
    { key: "create_workspace", name: "Tạo phòng ban / Không gian làm việc" },
    { key: "delete_workspace", name: "Xóa phòng ban / Không gian làm việc" },
    { key: "create_task", name: "Tạo công việc tổ chức mới" },
    { key: "edit_task", name: "Sửa đổi chi tiết công việc nhóm" },
    { key: "delete_task", name: "Xóa công việc tổ chức" },
    { key: "move_task", name: "Di chuyển công việc bất kỳ trên Kanban" },
    { key: "move_own_task", name: "Chỉ tự di chuyển việc được phân công" },
    { key: "export_excel", name: "Xuất báo cáo Excel" }
  ];

  const roles = ["admin", "manager", "member"];

  actions.forEach(action => {
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid var(--border-color)";
    
    let columnsHtml = `<td style="padding:12px 8px; font-weight:600; color:var(--text-main);">${action.name}</td>`;
    
    roles.forEach(role => {
      const isChecked = state.rolePermissions[role][action.key] === true;
      // Admin luôn có mọi quyền, khóa checkbox để tránh người dùng tự khóa tài khoản Admin
      const isDisabled = role === "admin";
      
      columnsHtml += `
        <td style="padding:12px 8px; text-align:center;">
          <input 
            type="checkbox" 
            class="permission-matrix-checkbox" 
            data-role="${role}" 
            data-action="${action.key}" 
            ${isChecked ? 'checked' : ''} 
            ${isDisabled ? 'disabled style="cursor:not-allowed;"' : 'style="cursor:pointer;"'}
          >
        </td>
      `;
    });

    row.innerHTML = columnsHtml;

    // Lắng nghe thay đổi Checkbox để cập nhật thời gian thực
    row.querySelectorAll(".permission-matrix-checkbox:not(:disabled)").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const targetRole = e.target.getAttribute("data-role");
        const targetAction = e.target.getAttribute("data-action");
        const isChecked = e.target.checked;

        state.rolePermissions[targetRole][targetAction] = isChecked;
        saveData();

        const roleNames = { admin: "Admin", manager: "Quản lý", member: "Thành viên" };
        showToast(
          "Cấu hình Phân quyền", 
          `Đã cập nhật quyền của <strong>${roleNames[targetRole]}</strong> đối với "${action.name}" thành <strong>${isChecked ? 'BẬT' : 'TẬT'}</strong>.`, 
          "success"
        );
      });
    });

    matrixContainer.appendChild(row);
  });
}
