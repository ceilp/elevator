/*
 * Available information:
 * 1. Request queue
 * Simulator.get_instance().get_requests()
 * Array of integers representing floors where there are people calling the elevator
 * eg: [7,3,2] // There are 3 people waiting for the elevator at floor 7,3, and 2, in that order
 * 
 * 2. Elevator object
 * To get all elevators, Simulator.get_instance().get_building().get_elevator_system().get_elevators()
 * Array of Elevator objects.
 * - Current floor
 * elevator.at_floor()
 * Returns undefined if it is moving and returns the floor if it is waiting.
 * - Destination floor
 * elevator.get_destination_floor()
 * The floor the elevator is moving toward.
 * - Position
 * elevator.get_position()
 * Position of the elevator in y-axis. Not necessarily an integer.
 * - Elevator people
 * elevator.get_people()
 * Array of people inside the elevator
 * 
 * 3. Person object
 * - Floor
 * person.get_floor()
 * - Destination
 * person.get_destination_floor()
 * - Get time waiting for an elevator
 * person.get_wait_time_out_elevator()
 * - Get time waiting in an elevator
 * person.get_wait_time_in_elevator()
 * 
 * 4. Time counter
 * Simulator.get_instance().get_time_counter()
 * An integer increasing by 1 on every simulation iteration
 * 
 * 5. Building
 * Simulator.get_instance().get_building()
 * - Number of floors
 * building.get_num_floors()
 */

var dir=[];

Elevator.prototype.decide = function () {
    var simulator = Simulator.get_instance();
    var building = simulator.get_building();
    var num_floors = building.get_num_floors();
    var elevators = Simulator.get_instance().get_building().get_elevator_system().get_elevators();
    var time_counter = simulator.get_time_counter();
    var requests = simulator.get_requests();
    var num_elevators = Simulator.get_instance().get_building().get_elevator_system().get_num_elevators();

    var elevator = this;
    var people = this.get_people();
    var person = people.length > 0 ? people[0] : undefined;

    if(dir.length==0){
        for(var g=0;g<num_elevators;g++){
            dir[g]=(g%2==0);
        }
    }

    // console.log(this.at_floor(),this.get_destination_floor(),elevator,this.get_people(),requests);
    // if(elevator.id==1){
    //     console.log(simulator.get_time_counter());
    //     console.log(elevator.at_floor());
    // }

    // direction priority: longest person inside elevator -> majority direction
    // var destinations = [];
    // var longest_waiting_people = [];
    // var longest_waiting_time = null;
    // var majority_direction = 0; // positive -> up, negative -> down
    // var direction_cost = 0;
    // var nearest_up_floor = null;
    // var nearest_down_floor = null;

    var nearest_people = [null,null]; // nearest above elevator person, nearest below elevator person
    var nearest_requests = [null,null];
    var UP=0;
    var DOWN=1;
    var new_destination=null;

    var valid_requests = requests.filter(function(floor){
        for(var i = 0; i < elevators.length;i++){
            if(elevators[i].id!=elevator.id && floor == elevators[i].get_destination_floor()){
                return false;
            }
        }
        return true;
    });

    var process_nearest_people = function(){
        for(var i = 0; i < people.length;i++){
            var distance = Math.abs(people[i].get_destination_floor() - elevator.at_floor());
            if(people[i].get_destination_floor()>elevator.at_floor()){
                if(nearest_people[UP]){
                    if(distance < (nearest_people[UP].get_destination_floor() - elevator.at_floor())){
                        nearest_people[UP]=people[i];
                    }
                }else{
                    nearest_people[UP]=people[i];
                }
            }else{
                if(nearest_people[DOWN]){
                    if(distance < (elevator.at_floor() - nearest_people[DOWN].get_destination_floor())){
                        nearest_people[DOWN]=people[i];
                    }
                }else{
                    nearest_people[DOWN]=people[i];
                }
            }
        }
    };

    var process_nearest_request = function(){
        for(var i = 0; i < valid_requests.length;i++){
            var distance = Math.abs(valid_requests[i] - elevator.at_floor());
            if(valid_requests[i]>elevator.at_floor()){
                if(nearest_requests[UP]){
                    if(distance < (nearest_requests[UP] - elevator.at_floor())){
                        nearest_requests[UP]=valid_requests[i];
                    }
                }else{
                    nearest_requests[UP]=valid_requests[i];
                }
            }else{
                if(nearest_requests[DOWN]){
                    if(distance < (elevator.at_floor() - nearest_requests[DOWN])){
                        nearest_requests[DOWN]=valid_requests[i];
                    }
                }else{
                    nearest_requests[DOWN]=valid_requests[i];
                }
            }
        }
    };

    var check_up_direction = function(){
        if(nearest_people[UP] && nearest_requests[UP]){
            if(nearest_people[UP].get_destination_floor() < nearest_requests[UP])
                new_destination = nearest_people[UP].get_destination_floor();
            else
                new_destination = nearest_requests[UP];
            return true;
        }
        if(nearest_people[UP]){
            new_destination = nearest_people[UP].get_destination_floor();
            return true;
        }
        if(nearest_requests[UP]){
            new_destination = nearest_requests[UP];
            return true;
        }
        return false;
    };

    var check_down_direction = function(){
        if(nearest_people[DOWN] && nearest_requests[DOWN]){
            if(nearest_people[DOWN].get_destination_floor() > nearest_requests[DOWN])
                new_destination = nearest_people[DOWN].get_destination_floor();
            else
                new_destination = nearest_requests[DOWN];
            return true;
        }
        if(nearest_people[DOWN]){
            new_destination = nearest_people[DOWN].get_destination_floor();
            return true;
        }
        if(nearest_requests[DOWN]){
            new_destination = nearest_requests[DOWN];
            return true;
        }
        return false;
    };

    process_nearest_people();
    process_nearest_request();

    if(dir[elevator.id-1]){
        if(!check_up_direction()){
            dir[elevator.id-1] = false;
            check_down_direction();
        }
    }else{
        if(!check_down_direction()){
            dir[elevator.id-1] = true;
            check_up_direction();
        }
    }

    if(new_destination){
        return this.commit_decision(new_destination);
    }





    // for (var i = 0; i < people.length; i++) {
    //     if (longest_waiting_time) {
    //         if (longest_waiting_time < people[i].get_wait_time_in_elevator()) {
    //             longest_waiting_people = [people[i]];
    //             longest_waiting_time = people[i].get_wait_time_in_elevator();
    //         } else if (longest_waiting_time == people[i].get_wait_time_in_elevator()) {
    //             longest_waiting_people.push(people[i]);
    //         }
    //     } else {
    //         longest_waiting_time = people[i].get_wait_time_in_elevator();
    //         longest_waiting_people = [people[i]];
    //     }
    //     if (people[i].get_destination_floor() > this.at_floor()) {
    //         majority_direction++;
    //         if(nearest_up_floor){
    //             if(people[i].get_destination_floor() < nearest_up_floor){
    //                 nearest_up_floor = people[i].get_destination_floor();
    //             }
    //         }else{
    //             nearest_up_floor = people[i].get_destination_floor();
    //         }
    //     } else if (people[i].get_destination_floor() < this.at_floor()) {
    //         majority_direction--;
    //         if(nearest_down_floor){
    //             if(people[i].get_destination_floor() > nearest_down_floor){
    //                 nearest_down_floor = people[i].get_destination_floor();
    //             }
    //         }else{
    //             nearest_down_floor = people[i].get_destination_floor();
    //         }
    //     }
    //     direction_cost += (people[i].get_destination_floor() - this.at_floor());
    //     destinations[i] = people[i].get_destination_floor();
    // }
    // person = longest_waiting_people.length > 0 ? longest_waiting_people[0] : null;
    //
    // var other_elevator_dest = [];
    // for(var x=0;x<elevators.length;x++){
    //     if(elevators[x].id != this.id){
    //         other_elevator_dest.push(elevators[x].get_destination_floor());
    //     }
    // }
    // sorted_requests=requests.sort(function(a,b){
    //     return a-b;
    // });
    //
    // console.log('cost',direction_cost);
    // if (person) {
    //     var direction = person.get_destination_floor()-elevator.at_floor();
    //     direction = direction_cost;
    //     if(direction > 0){
    //         new_destination_floor = nearest_up_floor;
    //     }else{
    //         new_destination_floor = nearest_down_floor;
    //     }
    //
    //     var check_valid_request = function(dest_floor){
    //         if(other_elevator_dest.indexOf(dest_floor)>-1)return false;
    //         if(direction > 0){
    //             return elevator.at_floor() < dest_floor && dest_floor < new_destination_floor;
    //         }else{
    //             return new_destination_floor < dest_floor && dest_floor < elevator.at_floor();
    //         }
    //     };
    //
    //     var valid_requests = sorted_requests.filter(check_valid_request);
    //     if(valid_requests.length > 0){
    //         if(direction>0) {
    //             new_destination_floor = valid_requests[0];
    //         }else{
    //             new_destination_floor = valid_requests[valid_requests.length-1];
    //         }
    //     }
    //     console.log('togo person inside', "a:"+this.at_floor(), "d:"+new_destination_floor, elevator, this.get_people(), requests);
    //     return this.commit_decision(new_destination_floor);
    // }else{
    //     var check_idle_elevators=function(elev){
    //         return elev.at_floor() == elev.get_destination_floor() && elev.id != elevator.id;
    //     };
    //     var idle_other_elevators= elevators.filter(check_idle_elevators);
    //
    //     var check_valid_request_floor = function(dest_floor){
    //         return other_elevator_dest.indexOf(dest_floor)==-1;
    //     };
    //     var valid_request = sorted_requests.filter(check_valid_request_floor);
    //     var nearest_request = [];
    //     var nearest_distance = [];
    //     for(var z=0;z<idle_other_elevators.length;z++){
    //         nearest_request.push(null);
    //         nearest_distance.push(null);
    //         for(var a=0;a<valid_request.length;a++){
    //             if(nearest_request[z]){
    //                 var distance = Math.abs(idle_other_elevators[z].at_floor()-valid_request[a]);
    //                 if(nearest_distance[z]>distance){
    //                     nearest_request[z]=valid_request[a];
    //                     nearest_distance[z]=Math.abs(idle_other_elevators[z].at_floor()-valid_request[a]);
    //                 }
    //             }else{
    //                 nearest_request[z]=valid_request[a];
    //                 nearest_distance[z]=Math.abs(idle_other_elevators[z].at_floor()-valid_request[a]);
    //             }
    //         }
    //     }
    //     if(requests.length>0){
    //         console.log('req',valid_request);
    //         console.log('elev',other_elevator_dest,idle_other_elevators);
    //         console.log('nearest',nearest_request,nearest_distance);
    //         console.log('length',nearest_request.length,nearest_distance.length);
    //         }
    //
    //     var check_request_not_other_elevator_next_destination = function(floor){
    //         var distance = Math.abs(elevator.at_floor()-floor);
    //         for(var b=0;b<nearest_request.length;b++){
    //             if(nearest_request[b]==floor && distance > nearest_distance[b]){
    //                 return false;
    //             }
    //         }
    //         return true;
    //     };
    //
    //     var available_dest = valid_request.filter(check_request_not_other_elevator_next_destination);
    //     if(requests.length>0) {
    //         console.log('available', available_dest);
    //     }
    //     nearest_distance=null;
    //     nearest_request=null;
    //     for(var y = 0; y < available_dest.length;y++){
    //         if(nearest_request){
    //             var floor_distance = Math.abs(elevator.at_floor()-available_dest[y]);
    //             if(nearest_distance>floor_distance){
    //                 nearest_request=available_dest[y];
    //                 nearest_distance=Math.abs(elevator.at_floor()-available_dest[y]);
    //             }
    //         }else{
    //             nearest_request = available_dest[y];
    //             nearest_distance = Math.abs(elevator.at_floor()-available_dest[y]);
    //         }
    //     }
    //     if(nearest_request){
    //         new_destination_floor = nearest_request;
    //         return this.commit_decision(new_destination_floor);
    //     }
    // }

    // new_destination_floor = Math.floor(num_floors / num_elevators * (this.id - .5));
    new_destination = num_floors / 2;
    return this.commit_decision(new_destination);
};
