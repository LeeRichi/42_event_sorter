<h1 align="center">
	✏️ 42-event-sorter
</h1>

<p align="center">
	<b><i>Chrome extension to help you to sort 42 events.</i></b><br>
</p>

<h3 align="center">
		<a href="#-about-the-project">About</a>
		<span> · </span>
		<a href="#-features-of-the-project">Features</a>
		<span> · </span>
		<a href="#-requirements">Requirements</a>
		<span> · </span>
		<a href="#-instructions">Instructions</a>
		<span> · </span>
		<a href="#-learning-goals">Learning Goals</a>
		<span> · </span>
		<a href="#-project-structure">Project Structure</a>
</h3>

---

## 💡 About the App

> 42-event-sorter helps you to easier browse the future/past events where the funtionality original 42 intra web page does not provide.

<img src="images/gifdemo.gif" alt="Demo Screenshot" width="600" height="300">

## 🌟 Features of the App
- Fetching data from 42 apis, including fetching events and feedbacks.
- Mulnipulate the web element by javascript alongside with service worker.

## 🛠️ Requirements

clone the project
```
git clone https://github.com/LeeRichi/42_event_sorter.git
```
Go to: chrome://extensions/
Click: Load unpacked, upload the cloned folder

Go to: [42 page](https://profile.intra.42.fr/events/marks)
Sort the events you want.

## 🔧 Instructions


### 1. Compiling the project

To compile the project, navigate to the project directory and run:<br>
>Tip: Some users might encounter errors when running the following commands in the VSCode terminal on Mac M1. However, using the original Terminal app on macOS can resolve the issue.

```shell
$ make
```

Other make-files-commands:
```shell
$ make bonus   # Compile with multiple pipes support
$ make clean   # Remove object files
$ make fclean  # Remove executable and object files
$ make re      # Recompile the project
```
**2. Using the program**

After compiling, you can use the push_swap program to sort a list of integers:
```
$ ./pipex infile "cmd1" "cmd2" outfile
```
example:
```
$ ./pipex input.txt "cat" "wc -l" output.txt
```

## 🎯 Learning Goals
- This project helps develop:
	- Process management: Using fork(), execve(), and waitpid() for process execution.
	- Inter-process communication: Utilizing pipe() to create data flow between commands.
	- File redirection: Handling file descriptors with dup2().
	- Error handling: Managing system calls and error messages properly.

## 📂 App Structure
```
.
├── README.md
├── background.js
├── content.js
├── icons
│   └── game.png
├── index.js
├── manifest.json
├── package-lock.json
├── package.json
├── popup.html
└── popup.js
```
<!-- ## 📸 screen shot
<img src="images/gifdemo.gif" alt="Demo Screenshot" width="600" height="300"> -->

