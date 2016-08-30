      var TodoListApp = React.createClass({
        getInitialState: function() {
          return ({data: []});
        },
        loadItemsFromServer: function() {
          $.ajax({
            url: this.props.url,
            type: 'GET',
            dataType: 'json',
            cache: false,
            success: function(data) {
              this.setState({data: data});
              localStorage.setItem('data', JSON.stringify(data));
            }.bind(this),
            error: function(xhr, status, err) {
              console.error(this.props.url, status, err.toString());
            }
          });
        },
        componentDidMount: function() {
          this.loadItemsFromServer();
          setInterval(this.loadItemssFromServer, this.props.pollInterval)
        },
        handleItemSubmit: function(todoItem) {
          var todoItems = this.state.data;
          todoItem.id = Date.now();
          todoItem.date = moment().format("MMM Do YY");
          todoItem.checked = false;
          var newItems = todoItems.concat([todoItem]);
          this.setState({data: newItems});
          $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: todoItem,
            success: function(data) {
              this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
              this.setState({data: todoItems});
              console.error(this.props.url, status, err.toString());
            }.bind(this)
          });
        },

        render: function() {
          return(
            <div className="container ">
              <div id="todoList" className="center-block">
                <h1 className="text-center heading">To-Do List</h1>
                <TodoListItems data={this.state.data} />
                <TodoListForm onItemSubmit={this.handleItemSubmit} />
              </div>
            </div>
          );
        }
      });

      var TodoListItems = React.createClass({
        render: function() {
          var todoNodes = this.props.data.map(function(todoItem) {
            return(
                <TodoItem key={todoItem.id} date={todoItem.date} >
                  {todoItem.text}
                </TodoItem>
            );
          });
          return(
            <div className="todoList">
              <ul className="text-center">
                {todoNodes}
              </ul>
            </div>
          );
        }
      });

      var TodoItem = React.createClass({
        // rawMarkup: function() {
        //   var md = new Remarkable();
        //   var rawMarkup = md.render(this.props.children.toString());
        //   return { __html: rawMarkup};
        // },

        getItems: function() {
          console.log(JSON.parse(localStorage.getItem('data')));
          return JSON.parse(localStorage.getItem('data'));
        },

        render: function() {

          return(
            <div className="row">
              <div className="col-md-12">
                <li className="todoItem">
                  <div className="checkbox checkbox-circle checkBox pull-right">
                    <input className="styled" type="checkbox" />
                    <label></label>
                  </div>
                      <p className="todo-text">{this.props.children.toString()}</p>
                      <i className="fa fa-pencil edit-pencil"></i>
                      <em>{this.props.date}</em>
                      <em>{this.getItems}</em>
                </li>
              </div>
            </div>
          );
        }
      });

      var TodoListForm = React.createClass({
        getInitialState: function() {
          return {text: ''};
        },
        handleTextChange: function(e) {
          this.setState({text: e.target.value});
        },
        handleSubmit: function(e) {
          e.preventDefault();
          var text = this.state.text.trim();
          if(!text) {
            return;
          }
          $('#taskInput').css('border-color', '#18BC9C');
          this.props.onItemSubmit({text: text});
          this.setState({text: ''});
        },
        render: function() {
          return (
            <form className="todoForm" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <div className="input-group">
                  <input id="taskInput" className="form-control" type="text" placeholder="Task" value={this.state.text} onChange={this.handleTextChange} />
                  <span className="input-group-btn">
                    <input className="btn btn-success" type="submit" value="Add" />
                  </span>
                </div>
              </div>
            </form>
          );
        }
      });

      ReactDOM.render(
        <TodoListApp url="/api/comments" pollInterval={2000} />,
        document.getElementById('content')
        );
