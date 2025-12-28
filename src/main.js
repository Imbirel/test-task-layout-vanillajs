import { COURSES_DATA, CATEGORY_MAP, PAGE_SIZE } from './data/coursesData';
import { debounce } from './utils/debounce';

class CourseCatalog {
  constructor(data = COURSES_DATA) {
    this.pageSize = PAGE_SIZE;
    this.courses = data.map((course) => ({
      ...course,
      _searchStr: `${course.title} ${course.author}`.toLowerCase(),
    }));

    const params = new URLSearchParams(window.location.search);
    this.currentFilter = params.get('category') || 'all';
    this.searchQuery = params.get('search') || '';

    this.filteredCourses = [...this.courses];
    this.itemsToShow = this.pageSize;
  }

  init() {
    this.cacheDOM();
    if (!this.coursesGrid || !this.template) return;

    this.bindEvents();

    this.syncUIWithFilters();
    this.filterCourses(false);
    this.updateCategoryCounts();
    this.render();
  }

  cacheDOM() {
    this.coursesGrid = document.getElementById('courses-grid');
    this.template = document.getElementById('course-card-template');
    this.emptyTemplate = document.getElementById('empty-state-template');
    this.searchInput = document.querySelector('.search__input');
    this.loadMoreButton = document.getElementById('load-more-button');
    this.tabsContainer = document.querySelector('.filters__tabs');
    this.tabButtons = document.querySelectorAll('.tabs__item');
  }

  bindEvents() {
    this.searchInput?.addEventListener(
      'input',
      debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300)
    );

    this.tabsContainer?.addEventListener('click', (e) => {
      const button = e.target.closest('.tabs__item');
      if (button) this.handleFilter(button);
    });

    this.loadMoreButton?.addEventListener('click', () => this.handleLoadMore());
  }

  syncUIWithFilters() {
    if (this.searchInput) this.searchInput.value = this.searchQuery;

    this.tabButtons.forEach((btn) => {
      const isActive = btn.dataset.category === this.currentFilter;
      btn.classList.toggle('tabs__item--active', isActive);
      btn.setAttribute('aria-selected', isActive.toString());
    });
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.resetPagination();
  }

  handleFilter(button) {
    this.currentFilter = button.dataset.category;
    this.syncUIWithFilters();
    this.resetPagination();
  }

  resetPagination() {
    this.itemsToShow = this.pageSize;
    this.filterCourses();
    this.render();
  }

  handleLoadMore() {
    const start = this.itemsToShow;
    const nextBatch = this.filteredCourses.slice(start, start + this.pageSize);

    this.itemsToShow += this.pageSize;
    this.appendCourses(nextBatch, start);
    this.updateLoadMoreButton();
  }

  filterCourses(updateHistory = true) {
    this.filteredCourses = this.courses.filter((course) => {
      const matchesCategory = this.currentFilter === 'all' || course.category === this.currentFilter;
      const matchesSearch = course._searchStr.includes(this.searchQuery);
      return matchesCategory && matchesSearch;
    });

    if (updateHistory) {
      const url = new URL(window.location);
      if (this.currentFilter !== 'all') url.searchParams.set('category', this.currentFilter);
      else url.searchParams.delete('category');

      if (this.searchQuery) url.searchParams.set('search', this.searchQuery);
      else url.searchParams.delete('search');

      window.history.pushState({}, '', url);
    }
  }

  appendCourses(courses, startIndex = 0) {
    const fragment = document.createDocumentFragment();
    courses.forEach((course, index) => {
      fragment.appendChild(this.createCourseCard(course, startIndex + index));
    });
    this.coursesGrid.appendChild(fragment);
  }

  render() {
    this.coursesGrid.innerHTML = '';
    const coursesToShow = this.filteredCourses.slice(0, this.itemsToShow);

    if (coursesToShow.length === 0) {
      this.renderEmptyState();
    } else {
      this.appendCourses(coursesToShow, 0);
    }
    this.updateLoadMoreButton();
  }

  renderEmptyState() {
    if (!this.emptyTemplate) return;
    this.coursesGrid.appendChild(this.emptyTemplate.content.cloneNode(true));
  }

  createCourseCard(course, index) {
    const clone = this.template.content.cloneNode(true);

    const card = clone.querySelector('.course-card');
    const img = clone.querySelector('.course-card__image');
    const categoryBadge = clone.querySelector('.course-card__category');
    const title = clone.querySelector('.course-card__title');
    const price = clone.querySelector('.course-card__price');
    const author = clone.querySelector('.course-card__author');

    const isPriority = index < PAGE_SIZE;
    if (isPriority) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.setAttribute('loading', 'lazy');
    }

    const categoryName = CATEGORY_MAP[course.category] || course.category;

    card.setAttribute('aria-label', `${course.title} course`);
    const imageName = course.img.split('/').pop();
    img.src = new URL(`/src/assets/img/${imageName}`, import.meta.url).href;
    img.alt = course.author;

    categoryBadge.textContent = categoryName;
    categoryBadge?.classList.add(`course-card__category--${course.category}`);

    title.textContent = course.title;
    price.textContent = `$${course.price}`;
    author.textContent = `by ${course.author}`;

    return clone;
  }

  updateLoadMoreButton() {
    if (!this.loadMoreButton) return;
    const hasMore = this.filteredCourses.length > this.itemsToShow;
    this.loadMoreButton.style.display = hasMore ? 'flex' : 'none';
  }

  updateCategoryCounts() {
    const counts = this.courses.reduce(
      (acc, { category }) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      { all: this.courses.length }
    );

    this.tabButtons?.forEach((button) => {
      const { category } = button.dataset;
      const countSpan = button.querySelector('.tabs__count');
      if (countSpan) {
        countSpan.textContent = counts[category] ?? 0;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CourseCatalog().init();
});
