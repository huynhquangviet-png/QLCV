/* app.js */

// Khai báo biến toàn cục quản lý trạng thái
let state = {
  members: [],
  workspaces: [],
  personalProjects: [],
  personalTasks: [],
  kanbanTasks: [],
  currentRole: "admin",
  theme: "light"
};

let currentTab = "dashboard";
let currentPersonalFilter = "inbox";
let currentPersonalProject = null;

// ==================== 1. KHỞI CHẠY ỨNG DỤNG (Initialization) ====================
document.addEventListener("DOMContentLoaded", () => {
  // Nạp dữ liệu từ localStorage
  state = loadData();

  // Áp dụng chủ đề giao diện lưu trữ
  applyTheme(state.theme);

  // Khởi tạo các sự kiện điều hướng (Tab Navigation)
  initNavigation();

  // Khởi tạo sự kiện đổi vai trò (Role Switcher)
  initRoleSwitcher();

  // Khởi tạo sự kiện của Trang cá nhân (Personal Task page events)
  initPersonalEvents();

  // Khởi tạo sự kiện của Trang Kanban (Kanban board events)
  initKanbanEvents();

  // Khởi tạo sự kiện của Lịch biểu (Calendar navigation events)
  initCalendarEvents();

  // Khởi tạo sự kiện Modals đóng/mở chung
  initModalGeneralEvents();

  // Khởi tạo bộ tìm kiếm thời gian thực
  initGlobalSearch();

  // Khởi tạo sự kiện tab Thành viên
  initMembersEvents();

  // Khởi tạo nút xuất Excel toàn cục trên Dashboard
  document.getElementById("dashboard-excel-btn").addEventListener("click", () => {
    exportToExcel("all");
  });

  // Mặc định nạp dữ liệu cho trang đầu tiên (Dashboard)
  renderActiveTab();
  
  // Hiển thị thông báo chào mừng
  showToast("TaskFlow Khởi động", "Ứng dụng quản lý công việc Premium đã sẵn sàng.", "success");
});

// ==================== 2. HỆ THỐNG ĐIỀU HƯỚNG TABS & THEME ====================
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-menu .nav-item");
  const sidebar = document.getElementById("app-sidebar");
  const menuToggle = document.getElementById("sidebar-toggle");

  // Xử lý chuyển tab
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      currentTab = item.getAttribute("data-tab");
      
      // Trên mobile, tự động đóng sidebar sau khi chọn tab
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove("open");
      }

      renderActiveTab();
    });
  });

  // Xử lý đóng/mở Sidebar trên di động
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("open");
    });

    // Click ra ngoài để đóng sidebar
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 1024 && !sidebar.contains(e.target) && e.target !== menuToggle) {
        sidebar.classList.remove("open");
      }
    });
  }

  // Đổi chủ đề Sáng / Tối
  const themeBtn = document.getElementById("theme-toggle");
  themeBtn.addEventListener("click", () => {
    const newTheme = state.theme === "light" ? "dark" : "light";
    state.theme = newTheme;
    saveData();
    applyTheme(newTheme);
    
    // Vẽ lại biểu đồ vì màu sắc nền cột SVG thay đổi theo chủ đề
    if (currentTab === "dashboard") {
      renderDashboardView(state);
    }
    
    showToast("Thay đổi giao diện", `Đã chuyển sang chế độ màn hình ${newTheme === 'dark' ? 'Tối' : 'Sáng'}.`, "info");
  });
}

function applyTheme(theme) {
  const html = document.documentElement;
  const sunIcon = document.getElementById("theme-icon-sun");
  const moonIcon = document.getElementById("theme-icon-moon");
  const themeText = document.getElementById("theme-text");

  html.setAttribute("data-theme", theme);

  if (theme === "dark") {
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
    themeText.textContent = "Giao diện sáng";
  } else {
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
    themeText.textContent = "Giao diện tối";
  }
}

function renderActiveTab() {
  // Ẩn tất cả các Section trước
  const tabs = ["dashboard", "personal", "kanban", "calendar", "members"];
  tabs.forEach(t => {
    document.getElementById(`${t}-tab`).classList.add("hidden");
  });

  // Hiển thị Section tương ứng
  document.getElementById(`${currentTab}-tab`).classList.remove("hidden");

  // Gọi hàm vẽ giao diện chi tiết của từng tab
  if (currentTab === "dashboard") {
    renderDashboardView(state);
  } else if (currentTab === "personal") {
    renderPersonalView(state, currentPersonalFilter, currentPersonalProject);
  } else if (currentTab === "kanban") {
    renderKanbanView(state);
  } else if (currentTab === "calendar") {
    renderCalendarView(state);
  } else if (currentTab === "members") {
    renderMembersView(state);
  }
}

// ==================== 3. GIẢ LẬP PHÂN QUYỀN (Role Simulator) ====================
function initRoleSwitcher() {
  const selector = document.getElementById("user-role-selector");
  const profileName = document.getElementById("profile-user-name");
  const profileRole = document.getElementById("profile-user-role");
  const profileAvatar = document.getElementById("profile-avatar");

  // Đồng bộ giao diện ban đầu với vai trò được nạp
  selector.value = state.currentRole;
  updateHeaderProfile(state.currentRole);

  selector.addEventListener("change", (e) => {
    const newRole = e.target.value;
    state.currentRole = newRole;
    saveData();
    
    updateHeaderProfile(newRole);
    
    // Tải lại giao diện tab hiện tại để cập nhật quyền (ẩn/hiện các chức năng nhạy cảm)
    renderActiveTab();

    const roleDetail = ROLES[newRole];
    showToast(
      "Thay đổi vai trò", 
      `Hiện đang giả lập: <strong>${roleDetail.name}</strong> (${roleDetail.roleName}). Các giới hạn quyền đã được áp dụng.`, 
      "warning"
    );
  });

  function updateHeaderProfile(roleKey) {
    const roleDetail = ROLES[roleKey];
    profileName.textContent = roleDetail.name;
    profileRole.textContent = roleDetail.roleName;
    profileAvatar.src = roleDetail.avatar;
  }
}

// ==================== 4. LOGIC CÔNG VIỆC CÁ NHÂN (Personal Tasks) ====================
function initPersonalEvents() {
  // Lắng nghe click các danh mục thời gian (Inbox, Today, Upcoming, Important)
  const timeFilters = document.querySelectorAll("[data-personal-filter]");
  timeFilters.forEach(btn => {
    btn.addEventListener("click", () => {
      timeFilters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Hủy chọn danh mục dự án tùy chọn
      const projectFilters = document.querySelectorAll("[data-personal-project-id]");
      projectFilters.forEach(b => b.classList.remove("active"));

      currentPersonalFilter = btn.getAttribute("data-personal-filter");
      currentPersonalProject = null;

      renderPersonalView(state, currentPersonalFilter, null);
    });
  });

  // Lắng nghe click danh mục dự án cá nhân
  const projectsListUl = document.getElementById("personal-projects-list");
  projectsListUl.addEventListener("click", (e) => {
    const li = e.target.closest("[data-personal-project-id]");
    if (!li) return;

    // Hủy chọn bộ lọc thời gian
    const timeFilters = document.querySelectorAll("[data-personal-filter]");
    timeFilters.forEach(b => b.classList.remove("active"));

    // Đánh dấu active cho dự án được chọn
    const siblings = projectsListUl.querySelectorAll(".category-link");
    siblings.forEach(s => s.classList.remove("active"));
    li.classList.add("active");

    currentPersonalFilter = null;
    currentPersonalProject = li.getAttribute("data-personal-project-id");

    renderPersonalView(state, null, currentPersonalProject);
  });

  // Tạo thêm danh mục cá nhân mới
  const addProjectBtn = document.getElementById("add-personal-project-btn");
  addProjectBtn.addEventListener("click", () => {
    const name = prompt("Nhập tên danh mục cá nhân mới:");
    if (!name || name.trim() === "") return;

    // Bảng màu ngẫu nhiên cho danh mục mới
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#ec4899"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newProject = {
      id: "proj-" + Date.now(),
      name: name.trim(),
      color: randomColor
    };

    state.personalProjects.push(newProject);
    saveData();
    
    // Render lại view cá nhân để cập nhật sidebar danh mục
    renderPersonalView(state, currentPersonalFilter, currentPersonalProject);
    showToast("Thành công", `Đã tạo danh mục cá nhân: "${newProject.name}"`, "success");
  });

  // Nút mở Modal thêm việc cá nhân mới
  const addTaskBtn = document.getElementById("add-personal-task-btn");
  addTaskBtn.addEventListener("click", () => {
    openPersonalTaskModal(null);
  });

  // Lưu Form công việc cá nhân
  const form = document.getElementById("personal-task-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const taskId = document.getElementById("personal-task-id").value;
    const title = document.getElementById("personal-title-input").value.trim();
    const desc = document.getElementById("personal-desc-input").value.trim();
    const projectId = document.getElementById("personal-project-select").value;
    const dueDate = document.getElementById("personal-date-input").value;
    const priority = document.getElementById("personal-priority-select").value;
    const tagsString = document.getElementById("personal-tag-input").value;

    const tags = tagsString ? tagsString.split(",").map(t => t.trim()).filter(t => t !== "") : [];

    if (!title || !dueDate) {
      showToast("Lỗi nhập liệu", "Vui lòng nhập đầy đủ tên và hạn chót.", "danger");
      return;
    }

    if (taskId) {
      // Chế độ chỉnh sửa (Edit mode)
      const task = state.personalTasks.find(t => t.id === taskId);
      if (task) {
        task.title = title;
        task.desc = desc;
        task.projectId = projectId;
        task.dueDate = dueDate;
        task.priority = priority;
        task.tags = tags;
        showToast("Cập nhật thành công", `Đã chỉnh sửa tác vụ cá nhân: "${title}"`, "success");
      }
    } else {
      // Chế độ tạo mới (Create mode)
      const newTask = {
        id: "p-" + Date.now(),
        title,
        desc,
        projectId,
        dueDate,
        priority,
        completed: false,
        tags
      };
      state.personalTasks.push(newTask);
      showToast("Tạo mới thành công", `Đã thêm việc cá nhân: "${title}"`, "success");
    }

    saveData();
    closeModal("personal-task-modal");
    renderPersonalView(state, currentPersonalFilter, currentPersonalProject);
    renderDashboardView(state);
  });
}

function openPersonalTaskModal(task = null) {
  const modal = document.getElementById("personal-task-modal");
  const form = document.getElementById("personal-task-form");
  const headline = document.getElementById("personal-modal-headline");
  const submitBtn = document.getElementById("personal-submit-btn");

  form.reset();

  // Nạp danh sách tùy chọn các Danh mục cá nhân vào Form select
  const select = document.getElementById("personal-project-select");
  select.innerHTML = '<option value="inbox">Hộp thư đến (Inbox)</option>';
  state.personalProjects.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });

  if (task) {
    // Sửa việc
    headline.textContent = "Chỉnh sửa công việc cá nhân";
    submitBtn.textContent = "Cập nhật";
    document.getElementById("personal-task-id").value = task.id;
    document.getElementById("personal-title-input").value = task.title;
    document.getElementById("personal-desc-input").value = task.desc || "";
    document.getElementById("personal-project-select").value = task.projectId || "inbox";
    document.getElementById("personal-date-input").value = task.dueDate;
    document.getElementById("personal-priority-select").value = task.priority || "medium";
    document.getElementById("personal-tag-input").value = (task.tags || []).join(", ");
  } else {
    // Thêm việc mới
    headline.textContent = "Thêm công việc cá nhân mới";
    submitBtn.textContent = "Lưu tác vụ";
    document.getElementById("personal-task-id").value = "";
    // Đặt mặc định hạn chót là ngày hôm nay
    document.getElementById("personal-date-input").value = getTodayString();
    
    // Nếu đang đứng trong bộ lọc danh mục cụ thể, chọn sẵn danh mục đó trong form
    if (currentPersonalProject) {
      document.getElementById("personal-project-select").value = currentPersonalProject;
    }
  }

  modal.classList.add("open");
}

// ==================== 5. LOGIC KANBAN NHÓM (Organizational Tasks) ====================
function initKanbanEvents() {
  const workspaceSelect = document.getElementById("kanban-workspace-select");

  // Đổi Phòng ban/Workspace hiển thị
  workspaceSelect.addEventListener("change", () => {
    renderKanbanView(state);
  });

  // Nút Xuất Excel Phòng ban
  document.getElementById("workspace-excel-btn").addEventListener("click", () => {
    const wsId = workspaceSelect.value;
    exportToExcel(wsId);
  });

  // Nút mở Modal thêm thẻ Kanban mới
  const addKanbanTaskBtn = document.getElementById("add-kanban-task-btn");
  addKanbanTaskBtn.addEventListener("click", () => {
    // KIỂM TRA PHÂN QUYỀN TRƯỚC KHI MỞ FORM
    const check = checkPermission("create_task");
    if (!check.granted) {
      showToast("Từ chối quyền hạn", check.reason, "danger");
      return;
    }
    openKanbanTaskModal(null);
  });

  // Lưu Form công việc Kanban nhóm
  const form = document.getElementById("kanban-task-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const taskId = document.getElementById("kanban-task-id").value;
    const title = document.getElementById("kanban-title-input").value.trim();
    const desc = document.getElementById("kanban-desc-input").value.trim();
    const projectTag = document.getElementById("kanban-project-tag").value.trim().toUpperCase();
    const dueDate = document.getElementById("kanban-date-input").value;
    const priority = document.getElementById("kanban-priority-select").value;
    const status = document.getElementById("kanban-status-select").value;
    const workspaceId = workspaceSelect.value;

    // Lấy danh sách thành viên được phân công từ checkboxes
    const checkedBoxes = document.querySelectorAll(".kanban-member-checkbox:checked");
    const assigneeIds = Array.from(checkedBoxes).map(cb => cb.value);

    if (!title || !projectTag || !dueDate) {
      showToast("Lỗi nhập liệu", "Vui lòng điền đủ các trường bắt buộc (*).", "danger");
      return;
    }

    const currentUser = ROLES[state.currentRole];

    if (taskId) {
      // Chế độ chỉnh sửa
      const task = state.kanbanTasks.find(t => t.id === taskId);
      if (task) {
        // KIỂM TRA PHÂN QUYỀN SỬA
        const check = checkPermission("edit_task", task);
        if (!check.granted) {
          showToast("Từ chối quyền hạn", check.reason, "danger");
          closeModal("kanban-task-modal");
          return;
        }

        task.title = title;
        task.desc = desc;
        task.projectTag = projectTag;
        task.dueDate = dueDate;
        task.priority = priority;
        task.status = status;
        task.assigneeIds = assigneeIds;

        task.activities.unshift({
          text: `${currentUser.name} đã cập nhật thông tin công việc chi tiết.`,
          time: new Date().toISOString()
        });

        showToast("Cập nhật thành công", `Đã lưu chỉnh sửa công việc nhóm: "${title}"`, "success");
      }
    } else {
      // Chế độ tạo mới
      const newTask = {
        id: "t-" + Date.now(),
        workspaceId,
        projectTag,
        title,
        desc,
        dueDate,
        priority,
        status,
        assigneeIds,
        comments: [],
        activities: [
          { text: `${currentUser.name} đã tạo công việc này.`, time: new Date().toISOString() }
        ]
      };
      state.kanbanTasks.push(newTask);
      showToast("Tạo mới thành công", `Đã thêm thẻ Kanban nhóm: "${title}"`, "success");
    }

    saveData();
    closeModal("kanban-task-modal");
    renderKanbanView(state);
    renderDashboardView(state);
  });

  // --- LOGIC MODAL CHI TIẾT KANBAN ---
  
  // Thêm bình luận mới
  const submitCommentBtn = document.getElementById("submit-comment-btn");
  submitCommentBtn.addEventListener("click", () => {
    if (!currentViewingKanbanTask) return;

    const input = document.getElementById("new-comment-input");
    const text = input.value.trim();
    if (text === "") return;

    const currentUser = ROLES[state.currentRole];
    
    // Ghi nhận bình luận mới
    const newComment = {
      authorId: currentUser.memberId,
      authorName: currentUser.name,
      text: text,
      time: new Date().toISOString()
    };

    if (!currentViewingKanbanTask.comments) currentViewingKanbanTask.comments = [];
    currentViewingKanbanTask.comments.push(newComment);

    // Ghi nhận vào Lịch sử hoạt động
    currentViewingKanbanTask.activities.unshift({
      text: `${currentUser.name} đã bình luận: "${text.substring(0, 25)}${text.length > 25 ? '...' : ''}"`,
      time: new Date().toISOString()
    });

    saveData();
    input.value = "";
    
    // Render lại danh sách bình luận và nhật ký
    renderKanbanComments(currentViewingKanbanTask, state);
    renderKanbanActivities(currentViewingKanbanTask);
    
    // Đồng bộ lại thẻ Kanban vì số bình luận tăng có thể cập nhật view (nếu hiển thị)
    renderKanbanView(state);
    showToast("Thảo luận", "Bình luận của bạn đã được đăng thành công.", "success");
  });

  // Bấm Enter để gửi bình luận
  document.getElementById("new-comment-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      submitCommentBtn.click();
    }
  });

  // Nút Sửa trên Modal chi tiết
  document.getElementById("detail-edit-btn").addEventListener("click", () => {
    if (!currentViewingKanbanTask) return;
    
    // KIỂM TRA PHÂN QUYỀN SỬA
    const check = checkPermission("edit_task", currentViewingKanbanTask);
    if (!check.granted) {
      showToast("Từ chối quyền hạn", check.reason, "danger");
      return;
    }

    closeModal("kanban-detail-modal");
    openKanbanTaskModal(currentViewingKanbanTask);
  });

  // Nút Xóa trên Modal chi tiết
  document.getElementById("detail-delete-btn").addEventListener("click", () => {
    if (!currentViewingKanbanTask) return;

    // KIỂM TRA PHÂN QUYỀN XÓA
    const check = checkPermission("delete_task", currentViewingKanbanTask);
    if (!check.granted) {
      showToast("Từ chối quyền hạn", check.reason, "danger");
      return;
    }

    if (confirm(`Bạn chắc chắn muốn xóa công việc tổ chức: "${currentViewingKanbanTask.title}"?`)) {
      state.kanbanTasks = state.kanbanTasks.filter(t => t.id !== currentViewingKanbanTask.id);
      saveData();
      closeModal("kanban-detail-modal");
      renderKanbanView(state);
      renderDashboardView(state);
      showToast("Đã xóa công việc", "Nhiệm vụ tổ chức đã được xóa khỏi hệ thống.", "success");
    }
  });
}

function openKanbanTaskModal(task = null) {
  const modal = document.getElementById("kanban-task-modal");
  const form = document.getElementById("kanban-task-form");
  const headline = document.getElementById("kanban-modal-headline");
  const submitBtn = document.getElementById("kanban-submit-btn");

  form.reset();

  // 1. Tạo danh sách Checkbox phân công thành viên
  const container = document.getElementById("kanban-members-checkboxes");
  container.innerHTML = "";
  state.members.forEach(m => {
    const wrapper = document.createElement("label");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "8px";
    wrapper.style.cursor = "pointer";
    wrapper.style.fontSize = "13px";
    wrapper.style.fontWeight = "550";
    wrapper.innerHTML = `
      <input type="checkbox" value="${m.id}" class="kanban-member-checkbox">
      <img src="${m.avatar}" style="width:20px; height:20px; border-radius:50%; object-fit:cover;">
      <span>${m.name} (${m.role})</span>
    `;
    container.appendChild(wrapper);
  });

  if (task) {
    // Sửa việc
    headline.textContent = "Chỉnh sửa công việc nhóm";
    submitBtn.textContent = "Cập nhật";
    document.getElementById("kanban-task-id").value = task.id;
    document.getElementById("kanban-title-input").value = task.title;
    document.getElementById("kanban-desc-input").value = task.desc || "";
    document.getElementById("kanban-project-tag").value = task.projectTag;
    document.getElementById("kanban-date-input").value = task.dueDate;
    document.getElementById("kanban-priority-select").value = task.priority || "medium";
    document.getElementById("kanban-status-select").value = task.status || "todo";

    // Check các thành viên đã được phân công trước đó
    const checkboxes = container.querySelectorAll(".kanban-member-checkbox");
    checkboxes.forEach(cb => {
      if (task.assigneeIds.includes(cb.value)) {
        cb.checked = true;
      }
    });
  } else {
    // Thêm việc mới
    headline.textContent = "Thêm công việc nhóm mới";
    submitBtn.textContent = "Lưu công việc";
    document.getElementById("kanban-task-id").value = "";
    document.getElementById("kanban-date-input").value = getTodayString();
    document.getElementById("kanban-status-select").value = "todo";
  }

  modal.classList.add("open");
}

// ==================== 6. DI CHUYỂN THỜI GIAN CALENDAR (Lịch biểu) ====================
function initCalendarEvents() {
  const prevBtn = document.getElementById("calendar-prev-btn");
  const nextBtn = document.getElementById("calendar-next-btn");
  const todayBtn = document.getElementById("calendar-today-btn");

  prevBtn.addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendarView(state);
  });

  nextBtn.addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendarView(state);
  });

  todayBtn.addEventListener("click", () => {
    currentCalendarDate = new Date();
    renderCalendarView(state);
  });
}

// ==================== 7. XUẤT BÁO CÁO EXCEL (CSV UTF-8 BOM) ====================
/**
 * Xuất dữ liệu công việc sang tệp CSV được mã hóa UTF-8 BOM
 * @param {string} scope - Phạm vi xuất ('all': toàn bộ, hoặc '[workspaceId]': theo phòng ban)
 */
function exportToExcel(scope = "all") {
  let tasksToExport = [];
  let fileName = "taskflow_report_all.csv";

  // 1. Phân loại dữ liệu cần xuất
  if (scope === "all") {
    // Xuất cả cá nhân và tổ chức
    const personal = state.personalTasks.map(t => ({
      id: t.id,
      title: t.title,
      type: "Cá nhân",
      category: state.personalProjects.find(p => p.id === t.projectId)?.name || "Hộp thư đến",
      dueDate: formatDate(t.dueDate),
      priority: t.priority === "high" ? "Cao" : (t.priority === "medium" ? "Trung bình" : "Thấp"),
      status: t.completed ? "Hoàn thành" : "Chờ làm",
      assignee: "Chính bạn"
    }));

    const kanban = state.kanbanTasks.map(t => {
      const assignees = state.members.filter(m => t.assigneeIds.includes(m.id)).map(m => m.name).join("; ");
      const statusMap = { backlog: "Yêu cầu", todo: "Cần làm", in_progress: "Đang làm", in_review: "Kiểm tra", done: "Hoàn thành" };
      const priorityMap = { urgent: "Cấp bách 🚨", high: "Cao", medium: "Trung bình", low: "Thấp" };

      return {
        id: t.id,
        title: t.title,
        type: "Tổ chức",
        category: state.workspaces.find(w => w.id === t.workspaceId)?.name || "Hệ thống",
        dueDate: formatDate(t.dueDate),
        priority: priorityMap[t.priority] || "Trung bình",
        status: statusMap[t.status] || "Cần làm",
        assignee: assignees || "Chưa giao"
      };
    });

    tasksToExport = [...personal, ...kanban];
    fileName = "BaoCao_TaskFlow_ToanBoCongViec.csv";
  } else {
    // Xuất theo phòng ban tổ chức cụ thể
    const ws = state.workspaces.find(w => w.id === scope);
    if (!ws) return;

    tasksToExport = state.kanbanTasks.filter(t => t.workspaceId === scope).map(t => {
      const assignees = state.members.filter(m => t.assigneeIds.includes(m.id)).map(m => m.name).join("; ");
      const statusMap = { backlog: "Yêu cầu", todo: "Cần làm", in_progress: "Đang làm", in_review: "Kiểm tra", done: "Hoàn thành" };
      const priorityMap = { urgent: "Cấp bách 🚨", high: "Cao", medium: "Trung bình", low: "Thấp" };

      return {
        id: t.id,
        title: t.title,
        type: "Tổ chức",
        category: ws.name,
        dueDate: formatDate(t.dueDate),
        priority: priorityMap[t.priority] || "Trung bình",
        status: statusMap[t.status] || "Cần làm",
        assignee: assignees || "Chưa giao"
      };
    });

    fileName = `BaoCao_TaskFlow_${ws.name.replace(/\s+/g, '')}.csv`;
  }

  if (tasksToExport.length === 0) {
    showToast("Không có dữ liệu", "Không tìm thấy tác vụ nào để lập báo cáo.", "warning");
    return;
  }

  // 2. Tạo nội dung file CSV
  const csvHeaders = ["Mã công việc", "Tên công việc", "Loại công việc", "Dự án / Phòng ban", "Ngày hết hạn", "Mức ưu tiên", "Trạng thái", "Người thực hiện"];
  let csvContent = "";

  // Thêm tiêu đề hàng
  csvContent += csvHeaders.join(",") + "\n";

  // Thêm dữ liệu hàng (Escape các ký tự dấu phẩy hoặc dấu nháy kép để tránh lệch cột)
  tasksToExport.forEach(task => {
    const row = [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`,
      task.type,
      `"${task.category}"`,
      task.dueDate,
      task.priority,
      task.status,
      `"${task.assignee}"`
    ];
    csvContent += row.join(",") + "\n";
  });

  // 3. Sử dụng UTF-8 Byte Order Mark (\uFEFF) giúp Excel tự động nhận diện đúng tiếng Việt có dấu
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // 4. Tạo đường dẫn tải về ảo và kích hoạt download
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Xuất Excel thành công", `Tệp báo cáo "${fileName}" đã được tải xuống máy của bạn.`, "success");
  } else {
    showToast("Trình duyệt không hỗ trợ", "Tính năng tải tệp tự động bị chặn bởi trình duyệt.", "danger");
  }
}

// ==================== 8. BỘ TÌM KIẾM THỜI GIAN THỰC (Global Search) ====================
function initGlobalSearch() {
  const searchInput = document.getElementById("global-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (currentTab === "personal") {
      // Tìm kiếm trên trang công việc cá nhân
      const taskRows = document.querySelectorAll("#personal-tasks-container .task-row");
      taskRows.forEach(row => {
        const titleText = row.querySelector(".task-title")?.textContent.toLowerCase() || "";
        const descText = row.querySelector(".task-meta")?.textContent.toLowerCase() || "";
        
        if (titleText.includes(query) || descText.includes(query)) {
          row.classList.remove("hidden");
        } else {
          row.classList.add("hidden");
        }
      });

    } else if (currentTab === "kanban") {
      // Tìm kiếm trên bảng Kanban
      const cards = document.querySelectorAll("#kanban-columns-container .kanban-card");
      cards.forEach(card => {
        const titleText = card.querySelector(".kanban-card-title")?.textContent.toLowerCase() || "";
        const descText = card.querySelector(".kanban-card-desc")?.textContent.toLowerCase() || "";
        const tagText = card.querySelector(".kanban-card-project")?.textContent.toLowerCase() || "";

        if (titleText.includes(query) || descText.includes(query) || tagText.includes(query)) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    }
  });

  // Hủy bộ tìm kiếm khi đổi tab
  const navItems = document.querySelectorAll(".nav-menu .nav-item");
  navItems.forEach(n => {
    n.addEventListener("click", () => {
      searchInput.value = "";
    });
  });
}

// ==================== 9. QUẢN LÝ DỰNG MODAL GIAO DIỆN CHUNG ====================
function initModalGeneralEvents() {
  // Lắng nghe đóng modal qua thuộc tính [data-close-modal="ID_MODAL"]
  const closeBtns = document.querySelectorAll("[data-close-modal]");
  closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close-modal");
      closeModal(modalId);
    });
  });

  // Đóng modal khi click vào vùng mờ backdrop bên ngoài
  const backdrops = document.querySelectorAll(".modal-backdrop");
  backdrops.forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  // Nút Lọc biểu đồ cột dâng cao trên Dashboard
  const filterBtns = document.querySelectorAll(".toggle-filter-btn[data-range]");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Vẽ lại biểu đồ Dashboard
      renderDashboardView(state);
    });
  });
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("open");
    // Nếu là modal chi tiết, xóa tham chiếu công việc hiện tại
    if (modalId === "kanban-detail-modal") {
      currentViewingKanbanTask = null;
    }
  }
}

// Trợ giúp định dạng ngày
function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function getTodayString() {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
  return localISOTime;
}

// ==================== 11. KHỞI TẠO LOGIC THÀNH VIÊN (Members and Perms Form Actions) ====================
function initMembersEvents() {
  const addMemberBtn = document.getElementById("add-member-btn");
  if (addMemberBtn) {
    addMemberBtn.addEventListener("click", () => {
      // KIỂM TRA PHÂN QUYỀN TẠO THÀNH VIÊN (Admin hoặc Manager được làm)
      const check = checkPermission("create_task"); // Mock check: ai có quyền tạo việc thì có quyền tạo thành viên
      if (!check.granted) {
        showToast("Từ chối quyền hạn", "Chỉ Quản trị viên hoặc Quản lý mới được phép thêm thành viên tổ chức.", "danger");
        return;
      }
      openMemberFormModal(null);
    });
  }

  // Submit Form thành viên
  const memberForm = document.getElementById("member-form");
  if (memberForm) {
    memberForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const memberId = document.getElementById("member-form-id").value;
      const name = document.getElementById("member-name-input").value.trim();
      const role = document.getElementById("member-role-input").value.trim();
      const avatarSelectValue = document.getElementById("member-avatar-select").value;

      if (!name || !role) {
        showToast("Lỗi nhập liệu", "Vui lòng nhập tên và chức vụ.", "danger");
        return;
      }

      // Map mã avatar select sang Unsplash ảnh chân dung đẹp
      const avatarUrls = {
        "av-1": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100", // Nam 1
        "av-2": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100", // Nữ 1
        "av-3": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100", // Nam 2
        "av-4": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100", // Nữ 2
        "av-5": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100"  // Nam 3
      };
      
      const avatarUrl = avatarUrls[avatarSelectValue] || avatarUrls["av-1"];

      if (memberId) {
        // Chế độ chỉnh sửa (Edit member)
        const m = state.members.find(member => member.id === memberId);
        if (m) {
          m.name = name;
          m.role = role;
          m.avatar = avatarUrl;
          showToast("Cập nhật thành công", `Đã sửa thông tin thành viên "${name}".`, "success");
        }
      } else {
        // Chế độ tạo mới (Create member)
        const newMember = {
          id: "m-" + Date.now(),
          name,
          role,
          avatar: avatarUrl
        };
        state.members.push(newMember);
        showToast("Tạo mới thành công", `Đã thêm thành viên mới "${name}".`, "success");
      }

      saveData();
      closeModal("member-form-modal");
      renderMembersView(state);
      renderKanbanView(state); // Cập nhật lại các danh sách phân công
    });
  }
}

function openMemberFormModal(member = null) {
  const modal = document.getElementById("member-form-modal");
  const form = document.getElementById("member-form");
  const headline = document.getElementById("member-modal-headline");
  const submitBtn = document.getElementById("member-submit-btn");

  form.reset();

  if (member) {
    headline.textContent = "Chỉnh sửa thông tin nhân sự";
    submitBtn.textContent = "Cập nhật";
    document.getElementById("member-form-id").value = member.id;
    document.getElementById("member-name-input").value = member.name;
    document.getElementById("member-role-input").value = member.role;

    // Tìm mã avatar tương ứng
    const avatarReverseMap = {
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100": "av-1",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100": "av-2",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100": "av-3",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100": "av-4",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100": "av-5"
    };
    document.getElementById("member-avatar-select").value = avatarReverseMap[member.avatar] || "av-1";
  } else {
    headline.textContent = "Thêm thành viên tổ chức";
    submitBtn.textContent = "Lưu thành viên";
    document.getElementById("member-form-id").value = "";
    document.getElementById("member-avatar-select").value = "av-1";
  }

  modal.classList.add("open");
}
