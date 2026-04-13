function HomePage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold text-white mb-6">
        Добро пожаловать в <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">НАЗВАНИЕ ПРОЕКТА</span>
      </h1>
      <p className="text-xl text-purple-200/80">
        Это главная страница твоего курсового проекта
      </p>
    </div>
  );
}

export default HomePage;