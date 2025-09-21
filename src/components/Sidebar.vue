<script setup>
import { ref, inject } from 'vue';
defineProps({
  activeView: String
});

const emit = defineEmits(['navigate', 'close']);
const isKonfigurasiOpen = ref(false);

const navigateTo = (view) => {
  emit('navigate', view);
};

const menuItems = [
  {
    name: 'Dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>`
  },
  {
    name: 'LaporanPelaksanaan',
    label: 'Lap. Internal Training',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
              fill="none">
            <path d="M20.7084 4.41165L10.4586 14.6986H14.0488V16.6986H7.04883V9.69861H9.04883V13.2799L19.2916 3L20.7084 4.41165Z" fill="white"/>
            <path d="M11 4.70581V6.70581H5V18.7058H17V12.7058H19V20.7058H3V4.70581H11Z" fill="white"/>
          </svg>`
  },
  {
    name: 'LaporanEvaluasi',
    label: 'Lap. External Training',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none">
    <path d="M18 20.75H6C5.27065 20.75 4.57118 20.4603 4.05546 19.9445C3.53973 19.4288 3.25 18.7293 3.25 18V6C3.25 5.27065 3.53973 4.57118 4.05546 4.05546C4.57118 3.53973 5.27065 3.25 6 3.25H12C12.1989 3.25 12.3897 3.32902 12.5303 3.46967C12.671 3.61032 12.75 3.80109 12.75 4C12.75 4.19891 12.671 4.38968 12.5303 4.53033C12.3897 4.67098 12.1989 4.75 12 4.75H6C5.66848 4.75 5.35054 4.8817 5.11612 5.11612C4.8817 5.35054 4.75 5.66848 4.75 6V18C4.75 18.3315 4.8817 18.6495 5.11612 18.8839C5.35054 19.1183 5.66848 19.25 6 19.25H18C18.3315 19.25 18.6495 19.1183 18.8839 18.8839C19.1183 18.6495 19.25 18.3315 19.25 18V12C19.25 11.8011 19.329 11.6103 19.4697 11.4697C19.6103 11.329 19.8011 11.25 20 11.25C20.1989 11.25 20.3897 11.329 20.5303 11.4697C20.671 11.6103 20.75 11.8011 20.75 12V18C20.75 18.7293 20.4603 19.4288 19.9445 19.9445C19.4288 20.4603 18.7293 20.75 18 20.75Z" fill="white"/>
    <path d="M20 8.75C19.8019 8.74741 19.6126 8.66756 19.4725 8.52747C19.3324 8.38737 19.2526 8.19811 19.25 8V4.75H16C15.8011 4.75 15.6103 4.67098 15.4697 4.53033C15.329 4.38968 15.25 4.19891 15.25 4C15.25 3.80109 15.329 3.61032 15.4697 3.46967C15.6103 3.32902 15.8011 3.25 16 3.25H20C20.1981 3.25259 20.3874 3.33244 20.5275 3.47253C20.6676 3.61263 20.7474 3.80189 20.75 4V8C20.7474 8.19811 20.6676 8.38737 20.5275 8.52747C20.3874 8.66756 20.1981 8.74741 20 8.75Z" fill="white"/>
    <path d="M13.5 11.25C13.3071 11.2352 13.1276 11.1455 13 11C12.877 10.8625 12.809 10.6845 12.809 10.5C12.809 10.3155 12.877 10.1375 13 10L19.5 3.5C19.5687 3.42631 19.6515 3.36721 19.7435 3.32622C19.8355 3.28523 19.9348 3.26319 20.0355 3.26141C20.1362 3.25963 20.2362 3.27816 20.3296 3.31588C20.423 3.3536 20.5078 3.40974 20.579 3.48096C20.6503 3.55218 20.7064 3.63701 20.7441 3.7304C20.7818 3.82379 20.8004 3.92382 20.7986 4.02452C20.7968 4.12523 20.7748 4.22454 20.7338 4.31654C20.6928 4.40854 20.6337 4.49134 20.56 4.56L14 11C13.8724 11.1455 13.6929 11.2352 13.5 11.25Z" fill="white"/>
    </svg>`
  },
  {
    name: 'LaporanDetail',
    label: 'Lap. Detail',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>`
  },
  {
    name: 'InputAbsensi',
    label: 'Input Absensi',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`
  },
  {
    name: 'GoogleFormLink',
    label: 'Link GForm',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>`
  },
];
const user = inject('user');
const logout = inject('logout');
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img src="/images/logo.png" alt="Logo Bosowa" class="logo">
      <h3 class="logo-title">Training Center</h3>
      <button class="close-menu" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:24px; height:24px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <nav class="sidebar-nav">
      <a v-for="item in menuItems"
         :key="item.name"
         href="#"
         class="nav-link"
         :class="{ 'nav-link-active': activeView === item.name }"
         @click.prevent="navigateTo(item.name)">
        
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-text">{{ item.label || item.name }}</span>
      </a>
      <div class="nav-dropdown">
        <a href="#" class="nav-link" @click.prevent="isKonfigurasiOpen = !isKonfigurasiOpen">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.007h2.593c.55 0 1.02.465 1.11 1.007l.073.438c.11.662.596 1.186 1.246 1.348l.418.106c.47.118.946.368 1.355.768l.317.317c.474.474.722 1.11.634 1.742l-.087.632c-.097.702-.45 1.34-.985 1.782l-.27.27c-.41.41-.85.74-1.326.953l-.42.213c-.696.353-1.15.99-1.21 1.742l-.04.463c-.09.542-.56 1.007-1.11 1.007H10.7c-.55 0-1.02-.465-1.11-1.007l-.04-.463c-.06-.752-.514-1.39-1.21-1.742l-.42-.213c-.476-.213-.916-.543-1.326-.953l-.27-.27c-.535-.442-.888-1.08-.985-1.782l-.087-.632c-.088-.632.16-1.268.634-1.742l.317-.317c.41-.4.885-.65 1.355-.768l.418-.106c.65-.163 1.136-.686 1.246-1.348l.073-.438zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>
          </span>
          <span class="nav-text">Konfigurasi</span>
          <span class="dropdown-arrow" :class="{ 'is-open': isKonfigurasiOpen }">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width:20px; height:20px;"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
          </span>
        </a>

        <div class="submenu" v-if="isKonfigurasiOpen">
  <a href="#" class="submenu-link" :class="{ 'submenu-link-active': activeView === 'KonfigurasiDivisi' }" @click.prevent="navigateTo('KonfigurasiDivisi')">
    
    <span class="submenu-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M22,11H17V6a1,1,0,0,0-.293-.707l-4-4a1,1,0,0,0-1.414,0l-4,4A1,1,0,0,0,7,6v5H2a1,1,0,0,0-1,1V22a1,1,0,0,0,1,1H22a1,1,0,0,0,1-1V12A1,1,0,0,0,22,11ZM3,13H7v8H3Zm6-1V6.414l3-3,3,3V21H13.5V19.5a1.5,1.5,0,0,0-3,0V21H9Zm12,9H17V13h4ZM4,14H6v2H4Zm0,4H6v2H4Zm16-2H18V14h2Zm0,4H18V18h2ZM10.5,7.5A1.5,1.5,0,1,1,12,9,1.5,1.5,0,0,1,10.5,7.5Z"/>
      </svg>
    </span>
    Konfigurasi Divisi

  </a>
  <a href="#" class="submenu-link" :class="{ 'submenu-link-active': activeView === 'KonfigurasiBulanan' }" @click.prevent="navigateTo('KonfigurasiBulanan')">
    
    <span class="submenu-icon">
      <svg viewBox="0 0 1920 1920" fill="currentColor">
        <path d="M1411.824 0c31.17 0 56.47 25.3 56.47 56.471v56.47h169.412c93.403 0 169.412 76.01 169.412 169.412V1920H113V282.353c0-93.402 76.009-169.412 169.412-169.412h169.41v-56.47c0-31.172 25.3-56.47 56.472-56.47s56.47 25.298 56.47 56.47v56.47h790.589v-56.47c0-31.172 25.299-56.47 56.47-56.47Zm282.352 564.705H225.942v1242.353h1468.234V564.705Zm-1016.47 677.648v338.824H338.882v-338.824h338.824Zm451.765 0v338.824H790.647v-338.824h338.824Zm451.764 0v338.824h-338.823v-338.824h338.823Zm-1016.47 112.941H451.824v112.941h112.941v-112.941Zm451.764 0H903.588v112.941h112.941v-112.941Zm451.765 0h-112.941v112.941h112.941v-112.941ZM677.706 790.588v338.824H338.882V790.588h338.824Zm451.765 0v338.824H790.647V790.588h338.824Zm451.764 0v338.824h-338.823V790.588h338.823ZM564.765 903.53H451.824v112.941h112.941V903.53Zm451.764 0H903.588v112.941h112.941V903.53Zm451.765 0h-112.941v112.941h112.941V903.53ZM451.823 225.882H282.412c-31.06 0-56.47 25.3-56.47 56.471v169.412h1468.234V282.353c0-31.172-25.411-56.47-56.47-56.47h-169.412v56.47c0 31.172-25.3 56.471-56.47 56.471-31.172 0-56.471-25.299-56.471-56.47v-56.472H564.765v56.471c0 31.172-25.3 56.471-56.471 56.471-31.171 0-56.471-25.299-56.471-56.47v-56.472Z" fill-rule="evenodd"/>
      </svg>
    </span>
    Konfigurasi Bulanan
  
  </a>
</div>
      </div>
       <div class="sidebar-footer">
    <div class="user-info">
      <span class="user-avatar">{{ user?.email?.charAt(0).toUpperCase() }}</span>
      <span class="user-email">{{ user?.email }}</span>
    </div>
    <button @click="logout" class="logout-button" title="Logout">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="yellow"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
    </button>
  </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  background-color: var(--sidebar-bg, #111827);
  color: var(--sidebar-text, #9CA3AF);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 5px 0 10px -2px rgba(59, 88, 255, 0.5);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background-color: #ffffff; 
  padding: 1.5rem;           
}

.logo {
  height: 40px;
  width: auto;
}

.logo-title {
  color: #111827;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  flex-grow: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--sidebar-text, #ffffff);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
  
}

.nav-link:hover {
  background-color: var(--sidebar-active-bg, #374151);
  color: var(--sidebar-text-hover, #FFFFFF);
}

.nav-link-active {
  background-color: var(--primary-color, #3B82F6);
  color: #FFFFFF;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  box-shadow: 0 0 8px rgba(255, 59, 59, 0.7), 0 0 12px rgba(255, 59, 59, 0.5);
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-text {
  white-space: nowrap;
}

.sidebar-header {
  position: relative; 
}

.close-menu {
  display: none;
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}
.close-menu svg {
  width: 24px;
  height: 24px;
  color: #9CA3AF;
}

@media (max-width: 768px) {
  .close-menu {
    display: block; 
  }
}

.nav-link {
  position: relative; 
}

.dropdown-arrow {
  position: absolute;
  right: 1rem;
  transition: transform 0.2s; 
}

.dropdown-arrow.is-open {
  transform: rotate(180deg); 
}

.submenu {
  display: flex;
  flex-direction: column;
  padding-left: 3.25rem;
  border-radius: 6px;
  margin-top: 0.25rem;
}

.submenu-link {
  color: var(--sidebar-text, #ffffff);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9em;

  display: flex;
  align-items: center;
  gap: 0.75rem; 
}

.submenu-link:hover {
  background-color: var(--sidebar-active-bg, #374151);
}

.submenu-link-active {
  color: #FFFFFF;
  font-weight: 600;
  background-color: var(--primary-color, #3B82F6);
}

.sidebar-footer {
  margin-top: auto; 
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.user-email {
  font-size: 0.85em;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #e5e7eb;
}

.logout-button {
  background: none;
  border: none;
  color: #e5e7eb;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.logout-button svg {
  width: 20px;
  height: 20px;
}
.submenu-icon {
  width: 20px; 
  height: 20px;
  flex-shrink: 0; 
  color: currentColor; 
}
</style>